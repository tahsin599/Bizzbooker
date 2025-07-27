package com.tahsin.backend.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.AIMessage;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.ApprovalStatus;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessHours;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Model.SlotConfiguration;
import com.tahsin.backend.Model.SlotInterval;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.AppointmentRepository;
import com.tahsin.backend.Repository.BusinessHoursRepository;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.ServiceCategoryRepository;
import com.tahsin.backend.Repository.SlotIntervalRepository;
import com.tahsin.backend.Service.AIConversationService;
import com.tahsin.backend.Service.AIMessageService;
import com.tahsin.backend.Service.NotificationService;
import com.tahsin.backend.Service.ReviewService;

import org.aspectj.weaver.patterns.ConcreteCflowPointcut.Slot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gemini")
public class GeminiModelController {

    private static final Logger log = LoggerFactory.getLogger(GeminiModelController.class);

    @Value("${spring.ai.openai.api-key}")
    private String GEMINI_API_KEY;

    private final RestClient restClient;
    private final AIMessageService messageService;
    private final AIConversationService conversationService;
    private final BusinessRepository businessRepository;
    private final SlotIntervalRepository slotIntervalRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private BusinessLocationRepository businessLocationRepository;
    @Autowired
    private BusinessHoursRepository businessHoursRepository;
    @Autowired
    private ReviewService reviewService;
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public GeminiModelController(RestClient restClient,
            AIMessageService messageService,
            AIConversationService conversationService,
            BusinessRepository businessRepository, SlotIntervalRepository slotIntervalRepository) {
        this.restClient = restClient;
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.businessRepository = businessRepository;
        this.slotIntervalRepository = slotIntervalRepository;

    }

    public static int mapDayOfWeekToNumber(DayOfWeek dayOfWeek) {
        // Java's DayOfWeek enum starts with Monday=1, so we adjust
        return (dayOfWeek.getValue() % 7); // Sunday=0, Monday=1, ..., Saturday=6
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chatCompletion(
            @RequestParam Long conversationId,
            @RequestBody String userPrompt) {

        try {
            // Get conversation
            AIConversation conversation = conversationService.getConversationById(conversationId);
            if (conversation == null) {
                return ResponseEntity.badRequest().body("Conversation not found");
            }

            // Get last 5 messages ordered oldest first
            List<AIMessage> lastMessages = messageService.getLastNMessagesByConversationId(conversationId, 5);

            // Build conversation history
            String conversationHistory = buildConversationHistory(lastMessages);
            System.out.println(conversationHistory);

            // Enhanced instruction prompt
            String instructionPrompt = """
                        HEY AI! LISTEN VERY CAREFULLY! YOU MUST FOLLOW THESE RULES PRECISELY

                        🔹 CORE PRINCIPLES:
                        1. RESPONSE FORMATTING:
                           - ONLY use the EXACT specified formats below
                           - NEVER add extra words, explanations or commentary
                           - ALWAYS maintain the pattern: "(data1:data2:data3):ResponseType"
                           - Use "na" for any missing information fields

                        2. DATE HANDLING:
                           - CURRENT REFERENCE DATE: %s (use for all calculations)
                           - Convert relative dates to absolute format (yyyy-MM-ddTHH:mm:ss)
                             - "next Monday" → calculate actual date
                             - "tomorrow" → current date + 1 day
                             - "in 3 days" → current date + 3 days
                           - NEVER use example dates (like 2023-12-25) - ALWAYS calculate real dates
                           - REJECT dates in the past with "(na):PastDateError"

                        3. CONTEXT AWARENESS:
                           - Remember these from the last 5 messages:
                             - Last mentioned business name
                             - Last mentioned location/area
                             - Last mentioned date/time
                           - For pronouns ("it", "there"), substitute with last context
                           - If previous AI reply was unhelpful ("(na):(na)"), ignore that context

                        4. ERROR HANDLING:
                           - If completely stuck, use "(na):(na)" but ONLY as last resort
                           - For ambiguous requests, make your best guess using context
                           - When rejecting, provide reason in the ResponseType (see below)

                        📜 RESPONSE PROTOCOLS (MUST FOLLOW EXACTLY):

                        A. BUSINESS TYPE INQUIRIES (categoryRequest)
                           "(category_name):categoryRequest"
                           - Categories: Healthcare, Beauty & Wellness, Restaurant & Food, Education,
                             Fitness, Professional Services, Automotive, Home Services, Event Planning, Technology
                           - Map user terms to these exact categories:
                             - "doctor" → "Healthcare"
                             - "salon" → "Beauty & Wellness"
                             - "gym" → "Fitness"
                             - etc.

                        B. BUSINESS CREATION (BusinessCreationRequest)
                           - Complete: "(area,city,address,business_name):BusinessCreationRequest"
                           - How-to guide: "(na:na:na:na):BusinessCreationRequest"
                           - Partial: "(area:na:address:business_name):BusinessCreationRequest"
                           Edge Cases:
                           - If user says "how do I list my business?" → use how-to format
                           - If missing critical info (like name) → use partial format

                        C. BUSINESS SEARCH BY TYPE (searchCategory)
                           - With area: "(area:category):searchCategory"
                           - No area: "(userIdNeeded):searchCategory"
                           Edge Cases:
                           - "Find restaurants" → "(na:Restaurant & Food):searchCategory"
                           - "Healthcare downtown" → "(downtown:Healthcare):searchCategory"

                        D. BUSINESS NAME SEARCH (searchBusiness).Also if the previous question was about the rating and now the user wants to know more:
                           "(exact_business_name):searchBusiness"
                           - Always use exact name match
                           - If similar names exist: pick most recent in context

                        E. BOOKING REQUESTS (BookingBusiness)
                           - Complete: "(business_name:area:slots:datetime):BookingBusiness"
                           - Partial: "(na:area:na:datetime):BookingBusiness"
                           Edge Cases:
                           - "Book 2 at Beachside tomorrow 2pm" → use last business name if available
                           - Past dates → "(na):PastDateError"
                           - Invalid slot count → "(na):InvalidSlotCount"

                        F. AVAILABILITY CHECK (CheckSlot)
                           - Complete: "(area,business_name,datetime):CheckSlot"
                           - Partial: "(area:na:datetime):CheckSlot"
                           Special Cases:
                           - "Any openings at Grand Hotel?" → use last known area/date if missing
                           - "How many slots Friday?" → calculate coming Friday's date

                        G. LOCATION INQUIRIES (locationCheck)
                           "(business_name):locationCheck"
                           - If name unknown: "(na):locationCheck"
                           - Respond with ALL locations if multiple exist

                        H. BUSINESS HOURS (CheckHours)
                           "(business_name):CheckHours"
                           Context Rules:
                           - If name omitted, check last 3 messages for business references
                           - "When does it close?" → use last mentioned business

                        I. SERVICE AREA CHECK (LocationServiceCheck) - NEW
                           "(service_type):LocationServiceCheck"
                           Trigger Condition:
                           - Only when previous AI reply indicated no services in area
                           - Extract service type from current/previous prompts

                        J. RATING CHECK REQUESTS (CheckRating):
                           "(business_name):CheckRating"

                           Trigger Patterns:
                           - "What is the rating of _"
                           - "Tell me the rating for _"
                           - "How good is _"
                           - "Is _ well rated"
                           - "What do people think about _"

                        K. ERROR CASES:
                           - Past dates: "(na):PastDateError"
                           - Invalid slots: "(na):InvalidSlotCount"
                           - Missing critical info: "(na):IncompleteRequest"
                        L.if the user wants to know highest rated businesses of certain type in a certain area:
                           -(areaName:category):RatingCheckHighest
                        M.if user wants to know about the slot price of a business then:
                           -(business name):SlotPrice


                        📜 CONTEXT PROCESSING RULES:
                        1. HISTORY ANALYSIS:
                           - Scan last 5 messages for missing pieces
                           - Ignore any "(na):(na)" responses in history
                           - Prioritize most recent relevant information

                        2. VAGUE REQUEST HANDLING:
                           - "it" = last mentioned business
                           - "there" = last mentioned area
                           - "then" = last mentioned datetime

                        3. CONFLICT RESOLUTION:
                           - When current prompt contradicts history, believe the prompt
                           - For ambiguous dates/times, assume soonest valid future slot

                        EXAMPLE SCENARIOS:

                        1. User: "Find me a gym in midtown"
                           AI: "(midtown:Fitness):searchCategory"

                        2. User: "How about massages?"
                           AI: "(midtown:Beauty & Wellness):searchCategory"

                        3. User: "Book 3 slots tomorrow at 3pm"
                           (Assuming last business was "Zen Spa")
                           AI: "(Zen Spa:na:3:2025-07-28T15:00:00):BookingBusiness"

                        4. User: "Is it open Sundays?"
                           AI: "(Zen Spa):CheckHours"

                        5. User: "No I meant Relaxation Center"
                           AI: "(Relaxation Center):CheckHours"

                        📜 HISTORY (oldest first):
                        %s

                        ❓ CURRENT QUESTION:
                        %s

                        YOUR ACTION PLAN:
                        1. ANALYZE question and history
                        2. IDENTIFY missing pieces from context
                        3. SELECT the correct response protocol
                        4. FORMAT response exactly as specified
                        5. VALIDATE against edge cases
                        6. RESPOND with only the formatted string
                    """
                    .formatted(LocalDateTime.now().toString(), conversationHistory, userPrompt);

            // Create Gemini request
            System.out.println("checking");
            Map<String, Object> requestBody = createGeminiRequest(instructionPrompt);
            System.out.println("Request Body: " + requestBody);

            // Call Gemini API
            String response = callGeminiAPI(requestBody);
            System.out.println(response);
            // Process the response with conversation context
            String processedResponse = processResponse(response, conversationId);

            // Save messages
            saveConversationMessages(conversation, userPrompt, processedResponse);

            return ResponseEntity.ok(processedResponse);

        } catch (Exception e) {
            log.error("Error in chat completion: ", e);
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    private String buildConversationHistory(List<AIMessage> messages) {
        return messages.stream()
                .map(msg -> "User: " + msg.getUserMessage() + "\nAI: " + msg.getAiReply())
                .collect(Collectors.joining("\n\n"));
    }

    private Map<String, Object> createGeminiRequest(String prompt) {
        return Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "topP", 0.8,
                        "maxOutputTokens", 200));
    }

    private String callGeminiAPI(Map<String, Object> requestBody) {
        return restClient.post()
                .uri(GEMINI_API_URL + "?key=" + GEMINI_API_KEY)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);
    }

    private String processResponse(String jsonResponse, Long conversationId) {
        try {
            // Extract the raw response text
            String responseText = extractResponseText(jsonResponse);

            // Split into parameters and response type
            String[] parts = responseText.split("\\):");
            if (parts.length < 2) {
                return "(na):(na)";
            }

            String parameters = parts[0].substring(1); // Remove opening parenthesis
            String responseType = parts[1];
            System.out.println(parameters);

            // Route to appropriate handler based on response type
            return switch (responseType) {
                case "categoryRequest" -> handleCategoryRequest(parameters);
                case "BusinessCreationRequest" -> handleBusinessCreationRequest(parameters, conversationId);
                case "searchCategory" -> handleSearchCategory(parameters);
                case "searchBusiness" -> handleSearchBusiness(parameters, conversationId);
                case "BookingCategory" -> handleBookingCategory(parameters);
                case "BookingBusiness" -> handleBookingBusiness(parameters, conversationId);
                case "checkCategory" -> handleCheckCategory(parameters);
                case "CheckSlot" -> handleCheckSlot(parameters);
                case "locationCheck" -> handleLocationCheck(parameters);
                case "Inquiry" -> handleEnquiry(conversationId);
                case "BookingInquiry" -> handleBookingEnquiry();
                case "Greeting" -> handleGreeting();
                case "CheckHours" -> handleHours(parameters, conversationId);
                case "LocationServiceCheck" -> handleLocationServiceCheck(parameters);
                case "CheckRating" -> handleRatingCheck(parameters);
                case "RatingCheckHighest" -> handleRatingCheckHighest(parameters);
                case "SlotPrice" -> handleSlotPrice(parameters);
                case "Gratitude" ->
                    "You're welcome! If you have any more questions or need more assistance, feel free to ask!I can always help you with your business related queries and bookings.";
                default -> handleGreeting();
            };
        } catch (Exception e) {
            log.error("Error processing response", e);
            return "Sorry I need some context to fulfill you request.";
        }
    }


    private String handleSlotPrice(String businessName){
        Business business=businessRepository.findByBusinessNameIgnoreCase(businessName);
        if(business==null){
            return "Sorry. Couldnt find any business with this name. Please ask about a valid business to know price.";
        }
        List<BusinessLocation> locations=business.getLocations();
        if(locations.isEmpty()){
            return "Sorry.This business is not configured in any area.";
        }

        List<SlotConfiguration> configs=locations.get(0).getSlotConfiguration();
        if(configs.isEmpty()){
            return "Sorry.The business "+business.getBusinessName()+" has not set their slot prices yet";
        }
        

        Double slot_price=configs.get(0).getSlotPrice();
        return "The slot price of "+business.getBusinessName()+" is "+slot_price+".Let me know if you want to know more information about this business";





        
    }

    private String handleRatingCheckHighest(String parameters) {
        // Parse parameters
        String[] parts = parameters.split(":");
        if (parts.length < 2) {
            return "Sorry. I don't have enough information to process your request.";
        }

        String area = parts[0];
        String category = parts[1];

        // Validate inputs
        if (area == null || area.isBlank()) {
            return "Please provide an area to search for businesses.";
        }

        if (category == null || category.isBlank()) {
            return "Please specify what type of service you're looking for.";
        }

        // Find service category
        ServiceCategory sc = serviceCategoryRepository.findByNameIgnoreCase(category).orElse(null);
        if (sc == null) {
            return "Sorry, no businesses in the " + category
                    + " category are registered in our system. Please try another category.";
        }

        // Find businesses in area and category
        List<Business> businesses = businessRepository
                .findByServiceCategoryIdAndLocationsArea(sc.getId(), area, Pageable.unpaged())
                .getContent();

        if (businesses.isEmpty()) {
            return "Sorry, no " + category + " businesses were found in " + area
                    + ". Would you like to try a different area?";
        }

        // Create list of businesses with their ratings
        List<BusinessRating> businessRatings = new ArrayList<>();
        for (Business business : businesses) {
            Double rating = reviewService.getAverageRatingByBusiness(business.getId());
            businessRatings.add(new BusinessRating(
                    business.getBusinessName(),
                    rating != null ? rating : 0.0,
                    business.getLocations().stream()
                            .filter(l -> area.equalsIgnoreCase(l.getArea()))
                            .findFirst()
                            .map(BusinessLocation::getAddress)
                            .orElse("Address not available")));
        }

        // Sort by rating (highest first)
        businessRatings.sort((a, b) -> Double.compare(b.rating, a.rating));

        // Determine how many to show (max 5)
        int businessesToShow = Math.min(5, businessRatings.size());
        List<BusinessRating> topBusinesses = businessRatings.subList(0, businessesToShow);

        // Build response
        StringBuilder response = new StringBuilder();
        if (businesses.size() > 5) {
            response.append("Here are the top 5 highest-rated ").append(category)
                    .append(" businesses in ").append(area).append(":\n\n");
        } else {
            response.append("Here are all the ").append(category)
                    .append(" businesses in ").append(area).append(":\n\n");
        }

        for (BusinessRating br : topBusinesses) {
            response.append("🏢 ").append(br.name).append("\n");
            response.append("⭐ Rating: ").append(String.format("%.1f", br.rating)).append("/5.0\n");
            response.append("📍 ").append(br.address).append("\n\n");
        }

        if (businesses.size() > 5) {
            response.append("There are ").append(businesses.size() - 5)
                    .append(" more businesses available. Would you like to see them?");
        }

        return response.toString();
    }

    // Helper record to store business rating info
    private record BusinessRating(String name, double rating, String address) {
    }

    private String handleRatingCheck(String businessName) {
        // Find the business by name (case insensitive)
        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "No business with this name is registered in the system. Please provide a valid business name if you want to check ratings.";
        }

        // Get the average rating
        Double rating = reviewService.getAverageRatingByBusiness(business.getId());

        // If business has no ratings (0.0), show top alternatives
        if (rating == null || rating == 0.0) {
            // Get all businesses in the same category
            Page<Business> sameCategoryBusinesses = businessRepository.findByServiceCategoryId(
                    business.getServiceCategory().getId(),
                    Pageable.unpaged());

            // Get top 5 rated businesses in same category (excluding the current one)
            List<Business> topRated = sameCategoryBusinesses.getContent().stream()
                    .filter(b -> !b.getId().equals(business.getId())) // exclude current business
                    .sorted((b1, b2) -> {
                        Double r1 = reviewService.getAverageRatingByBusiness(b1.getId());
                        Double r2 = reviewService.getAverageRatingByBusiness(b2.getId());
                        return Double.compare(
                                r2 != null ? r2 : 0.0,
                                r1 != null ? r1 : 0.0);
                    })
                    .limit(5)
                    .collect(Collectors.toList());

            if (topRated.isEmpty()) {
                return "This business hasn't been rated yet, and we couldn't find other businesses in the same category.";
            }

            // Build response with top alternatives
            StringBuilder response = new StringBuilder();
            response.append(
                    "This business hasn't been rated yet. Here are the top rated businesses that provide similar services:\n");

            for (Business b : topRated) {
                Double businessRating = reviewService.getAverageRatingByBusiness(b.getId());
                response.append("- ").append(b.getBusinessName())
                        .append(" (Rating: ")
                        .append(String.format("%.1f", businessRating != null ? businessRating : 0.0))
                        .append("/5.0)\n");
            }

            return response.toString();
        }

        // If business has ratings, return the average
        return String.format("The average rating for %s is %.1f/5.0",
                business.getBusinessName(),
                rating) + ".If you would like to know more information about this business,please let me know";
    }

    private String handleLocationServiceCheck(String parameters) {
        ServiceCategory sc = serviceCategoryRepository.findByNameIgnoreCase(parameters).orElse(null);
        if (sc == null) {
            return "No businesses of this type are registered in our system. Sorry for the inconvenience.";
        }

        Page<Business> businesses = businessRepository.findByServiceCategoryId(sc.getId(), Pageable.unpaged());

        // Use a Set to avoid duplicate areas
        Set<String> uniqueAreas = new HashSet<>();

        for (Business b : businesses) {
            List<BusinessLocation> locations = businessLocationRepository.findByBusiness(b);
            for (BusinessLocation location : locations) {
                if (location.getArea() != null && !location.getArea().isEmpty()) {
                    uniqueAreas.add(location.getArea());
                }
            }
        }

        if (uniqueAreas.isEmpty()) {
            return "We couldn't find any specific locations offering " + sc.getName() + " services.";
        }

        // Format the areas list naturally
        String areasList;
        if (uniqueAreas.size() == 1) {
            areasList = "the " + uniqueAreas.iterator().next() + " area";
        } else {
            List<String> sortedAreas = new ArrayList<>(uniqueAreas);
            Collections.sort(sortedAreas);

            if (sortedAreas.size() == 2) {
                areasList = sortedAreas.get(0) + " and " + sortedAreas.get(1);
            } else {
                String last = sortedAreas.remove(sortedAreas.size() - 1);
                areasList = String.join(", ", sortedAreas) + ", and " + last;
            }
            areasList = "these areas: " + areasList;
        }

        return sc.getName() + " services are available in " + areasList + ". " +
                "Would you like me to help you find specific businesses in any of these locations?";
    }

    private String handleHours(String businessName, Long conversationId) {
        if (businessName == null || businessName.isBlank()) {
            // Check conversation history for last mentioned business name
            AIConversation conversation = conversationService.getConversationById(conversationId);
            List<AIMessage> lastMessages = messageService.getLastNMessagesByConversationId(conversationId, 5);
            for (AIMessage msg : lastMessages) {
                if (msg.getUserMessage().contains("business") || msg.getAiReply().contains("business")) {
                    String[] parts = msg.getUserMessage().split(":");
                    if (parts.length > 0) {
                        businessName = parts[0];
                        break;
                    }
                }
            }
        }

        if (businessName == null || businessName.isBlank()) {
            return "Please provide a valid business name to check its hours.";
        }

        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "The business '" + businessName + "' does not exist. Please check the name and try again.";
        }
        // Fetch business hours
        List<BusinessHours> hoursList = businessHoursRepository.findByBusinessId(business.getId());

        if (hoursList.isEmpty()) {
            return "The business '" + businessName + "' hasn't set their working hours yet.";
        }

        // Group by day and check for closed days
        Map<Integer, BusinessHours> hoursByDay = hoursList.stream()
                .collect(Collectors.toMap(
                        BusinessHours::getDayOfWeek,
                        Function.identity()));

        StringBuilder response = new StringBuilder();
        response.append("Here are the operating hours for ").append(businessName).append(":\n\n");

        // Define day names with 0=Sunday
        String[] dayNames = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

        for (int day = 0; day < 7; day++) {
            BusinessHours hours = hoursByDay.get(day);
            String dayName = dayNames[day];

            if (hours == null || hours.getIsClosed()) {
                response.append("• ").append(dayName).append(": Closed\n");
            } else {
                response.append("• ").append(dayName)
                        .append(": Open from ")
                        .append(formatTime(hours.getOpenTime()))
                        .append(" to ")
                        .append(formatTime(hours.getCloseTime()))
                        .append("\n");
            }
        }

        return response.toString();
    }

    // Helper method to format time in AM/PM
    private String formatTime(LocalTime time) {
        if (time == null)
            return "Closed";

        int hour = time.getHour();
        int minute = time.getMinute();
        String amPm = hour < 12 ? "AM" : "PM";

        // Convert to 12-hour format
        hour = hour % 12;
        hour = hour == 0 ? 12 : hour;

        return String.format("%d:%02d %s", hour, minute, amPm);
    }

    private String handleGreeting() {
        return "Hello,I am Bizzy! How can I assist you today? If you have any questions about businesses or bookings, feel free to ask!";
    }

    private String handleEnquiry(Long conversationId) {
        User user = conversationService.getConversationById(conversationId).getUser();
        return "Hello " + user.getName()
                + "! I am Bizzy, your personal business assistant. I can help you find businesses, book appointments, and answer your questions about our services. Just ask me anything related to businesses or bookings, and I'll do my best to assist you!";

    }

    private String handleBookingEnquiry() {
        return "You can go to the services option on top your dashboard where you can filter based on different services and areas also you can search for businesses in the search area. After finding a business you will be able book it from the profile of that business.Also to make your life easier,I can help you book appointments with businesses. Just tell me the business name, location, and your preferred date and time, and I'll check availability for you and I can also book for you.";
    }

    private String extractResponseText(String jsonResponse) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(jsonResponse);

        if (rootNode.has("candidates") && rootNode.get("candidates").isArray()
                && rootNode.get("candidates").size() > 0) {
            JsonNode candidate = rootNode.get("candidates").get(0);
            if (candidate.has("content") && candidate.get("content").has("parts")) {
                JsonNode parts = candidate.get("content").get("parts");
                if (parts.isArray() && parts.size() > 0 && parts.get(0).has("text")) {
                    return parts.get(0).get("text").asText().trim();
                }
            }
        }

        if (rootNode.has("text")) {
            return rootNode.get("text").asText().trim();
        }

        return "(na):(na)";
    }

    private String handleSearchBusiness(String businessName, Long conversationId) {
        try {
            // Search for businesses (case-insensitive contains search)
            Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
            System.out.println(businessName);

            if (business == null) {
                return "Business with this name does not exist. Please enter a valid business name and i will provide details about it.";
            } else {
                // Format found businesses
                List<BusinessLocation> locations = business.getLocations();
                String a = "The business " + business.getBusinessName() + " is located at ";
                String locationDetails = locations.stream()
                        .map(loc -> loc.getArea() + ", " + loc.getCity() + ", " + loc.getAddress())
                        .collect(Collectors.joining("; "));
                return a + locationDetails
                        + ". If you want to book an appointment with this business, please provide the date and time.";
            }
        } catch (Exception e) {
            log.error("Error searching for business: " + businessName, e);
            return "(na):searchBusiness";
        }
    }

    private String handleCategoryRequest(String categoryName) {
        ServiceCategory sc = serviceCategoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
        if (sc == null) {
            return "Sorry, no businesses of this type are registered in our system.";
        }

        List<Business> businesses = businessRepository.findByServiceCategoryId(sc.getId(), Pageable.unpaged())
                .getContent();

        if (businesses.isEmpty()) {
            return "We couldn't find any businesses in the " + categoryName + " category.";
        }

        // For 5 or fewer businesses, show all
        if (businesses.size() <= 5) {
            StringBuilder response = new StringBuilder("Here are all the " + categoryName + " businesses:\n");
            for (Business business : businesses) {
                response.append("- ").append(business.getBusinessName()).append("\n");
            }
            return response.toString();
        }
        // For more than 5 businesses, show top 5 rated
        else {
            // Create two parallel lists to store names and ratings
            List<String> businessNames = new ArrayList<>();
            List<Double> businessRatings = new ArrayList<>();

            // Collect all business names and ratings
            for (Business business : businesses) {
                businessNames.add(business.getBusinessName());
                Double rating = reviewService.getAverageRatingByBusiness(business.getId());
                businessRatings.add(rating != null ? rating : 0.0);
            }

            // Sort both lists by rating (highest first)
            for (int i = 0; i < businessRatings.size(); i++) {
                for (int j = i + 1; j < businessRatings.size(); j++) {
                    if (businessRatings.get(i) < businessRatings.get(j)) {
                        // Swap ratings
                        double tempRating = businessRatings.get(i);
                        businessRatings.set(i, businessRatings.get(j));
                        businessRatings.set(j, tempRating);

                        // Swap names to maintain correspondence
                        String tempName = businessNames.get(i);
                        businessNames.set(i, businessNames.get(j));
                        businessNames.set(j, tempName);
                    }
                }
            }

            // Build response with top 5
            StringBuilder response = new StringBuilder(
                    "Here are the top 5 highest-rated " + categoryName + " businesses:\n");
            for (int i = 0; i < Math.min(5, businessNames.size()); i++) {
                response.append("- ").append(businessNames.get(i))
                        .append(" (Rating: ").append(String.format("%.1f", businessRatings.get(i))).append("/5.0)\n");
            }
            response.append("\nThere are more businesses available in this category. Would you like to see more?");
            return response.toString();
        }
    }

    private String handleBusinessCreationRequest(String params, Long conversationId) {

        User user = conversationService.getConversationById(conversationId).getUser();
        return "Hey there , " + user.getName()
                + " ! You can add your own businesses for other customers to find and book appointments with. Go to the 'Create Business' section in your dashboard and fill out the required information. If you need help, just ask me!Then after that you can add business hours for your business and slots so that customers can book appointments with it you can do theese by going to my business section in your dashborad.Thank you";

    }

    private String handleSearchCategory(String params) {
        System.out.println(params);
        String[] parts = params.split(":");
        if (parts.length < 2) {
            return "please provide sufficient information to know about businesses";
        }
        String area = parts[0].equals("na") ? null : parts[0];
        String categoryName = parts[1].equals("na") ? null : parts[1];
        if (categoryName == null || categoryName.isBlank()) {
            return "please provide valid category name to know about businesses";
        }
        if (area == null || area.isBlank()) {
            return "mention the area you are interested in to know about businesses";
        }
        // Find businesses by category and area

        ServiceCategory sc = serviceCategoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
        if (sc == null) {
            return "I am sorry.No businesses of the relevant category are registered in our system. Please try with another category.Thank you.";
        }

        List<Business> businesses = businessRepository
                .findByServiceCategoryIdAndLocationsArea(sc.getId(), area, Pageable.unpaged())
                .getContent();
        if (businesses.isEmpty()) {
            return "I am sorry.No businesses of the this sort are registered in this area. Please tell me if you need this service in a different area.Thank you.";
        }
        return "Here are the businesses in " + area + " that meets your requirements " + categoryName + ": "
                + businesses.stream()
                        .map(Business::getBusinessName)
                        .collect(Collectors.joining(", "))
                + ". If you want to book an appointment with any of these businesses, please provide the date and time.";
    }

    private String handleBookingCategory(String categoryName) {

        return "(" + categoryName + "):BookingCategory";
    }

    private String handleBookingBusiness(String params, Long conversationId) {
        System.out.println(params);

        String[] parts = params.split(":");
        if (parts.length < 4) {
            return "Please provide all required information: area, business name, and date/time.";
        }

        String area = parts[1].equals("na") ? null : parts[1];
        String businessName = parts[0].equals("na") ? null : parts[0];
        String slots = parts[2].equals("na") ? null : parts[2];
        String dateTimeStr = parts[3].equals("na") ? null : parts[3] + ":" + parts[4] + ":" + parts[5];
        ;

        // Validate inputs
        if (businessName == null || businessName.isBlank()) {
            return "Please provide a valid business name.";
        }
        if (dateTimeStr == null) {
            return "Please provide a valid date and time for knowing about available slots.";
        }
        if (slots == null || slots.isBlank()) {
            return "Please provide the number of slots you want to book.";
        }
        LocalDateTime desiredDateTime;
        try {
            desiredDateTime = LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            return "The date format is incorrect. Please use format like: 2023-12-25T14:00:00";
        }
        LocalDateTime bdDateTime = LocalDateTime.now(ZoneId.of("Asia/Dhaka"));
        if (desiredDateTime.isBefore(bdDateTime)) {
            return "No slots can be booked in the past. Please provide a realistic date and time.";
        }

        // Check if business exists
        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "The business '" + businessName + "' doesn't exist. Please check the name and try again.";
        }
        // Check if location exists for this business
        List<BusinessLocation> locations = business.getLocations();
        if (locations == null || locations.isEmpty()) {
            return "The business '" + businessName + "' doesn't have any locations registered yet.";
        }
        // Find matching location by area (if provided)
        // Optional<BusinessLocation> matchingLocation = locations.stream()
        // .filter(loc -> area == null ||
        // (loc.getArea() != null && loc.getArea().equalsIgnoreCase(area)))
        // .findFirst();
        Optional<BusinessLocation> matchingLocation = businessLocationRepository
                .findOneByBusinessIdAndKeyword(business.getId(), area);
        if (!matchingLocation.isPresent()) {
            String locationMessage = area == null
                    ? "Please specify which location you're interested in. Available locations: " +
                            locations.stream()
                                    .map(loc -> loc.getArea() + " (" + loc.getAddress() + ")")
                                    .collect(Collectors.joining(", "))
                    : "No location found in area '" + area + "'. Available areas: " +
                            locations.stream()
                                    .map(BusinessLocation::getArea)
                                    .filter(a -> a != null && !a.isEmpty())
                                    .collect(Collectors.joining(", "));
            return locationMessage;
        }
        int slotsToBook;
        try {
            slotsToBook = Integer.parseInt(slots);
        } catch (NumberFormatException e) {
            return "Please provide a valid number of slots to book.";
        }
        if (slotsToBook <= 0) {
            return "Please provide a positive number of slots to book.";
        }
        BusinessLocation location = matchingLocation.get();

        DayOfWeek dayOfWeek = desiredDateTime.getDayOfWeek();
        int dayNumber = mapDayOfWeekToNumber(dayOfWeek);
        BusinessHours businessHours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(business.getId(), dayNumber)
                .orElse(null);
        if (businessHours == null) {
            return "The buisness has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contect them using the contact information provided in the business profile.";
        }
        if (businessHours.getIsClosed()) {
            return "Sorry.The business is closed on this day. Please choose another day to book an appointment.";
        }
        if (businessHoursRepository.findByBusinessId(business.getId()).isEmpty()) {
            return "The business has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contact them using the contact information provided in the business profile.";
        }

        LocalTime openTime = businessHours.getOpenTime();
        LocalTime closeTime = businessHours.getCloseTime();
        LocalTime desiredTime = desiredDateTime.toLocalTime();

        if (desiredTime.isBefore(openTime) || desiredTime.isAfter(closeTime)) {
            return "The business is closed at this time. It is open from " + openTime + " to " + closeTime
                    + ". Please choose a time within these hours.";
        }

        if (businessHours.getOpenTime() == null || businessHours.getCloseTime() == null) {
            return "The business has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contact them using the contact information provided in the business profile.";
        }

        // Check slot availability (using your repository method)
        int availableSlots = slotIntervalRepository.getAvailableSlotsCount(
                location.getId(),
                desiredDateTime);
        if (availableSlots < slotsToBook) {
            return "Sorry, there are only " + availableSlots + " available slot(s) at " + location.getArea() +
                    " for " + desiredDateTime.toLocalDate() + " at " +
                    desiredDateTime.toLocalTime() + ". Would you like to book fewer slots?";
        } else {
            // Here you would typically create a booking in your system
            // For now, just return a success message
            Appointment appointment = new Appointment();
            appointment.setBusiness(business);
            appointment.setLocation(location);
            SlotInterval slotInterval = slotIntervalRepository
                    .findSlotIntervalAtDateTime(location.getId(), desiredDateTime)
                    .orElse(null);
            if (slotInterval == null) {
                return "No slot interval found for the specified date and time. Please try again.";
            }
            LocalDate desiredDate = desiredDateTime.toLocalDate();

            // Get the start time from your slot interval
            LocalTime startTime = slotInterval.getStartTime(); // e.g., 09:00:00

            // Combine them to create a new LocalDateTime
            LocalDateTime startDateTime = LocalDateTime.of(desiredDate, startTime);
            appointment.setStartTime(startDateTime);
            LocalDateTime endDateTime = LocalDateTime.of(desiredDate, slotInterval.getEndTime());
            appointment.setEndTime(endDateTime);
            slotInterval.setUsedSlots(slotInterval.getUsedSlots() + slotsToBook);
            System.out.println(slotInterval.getConfiguration().getId());
            slotIntervalRepository.save(slotInterval);
            appointment.setCustomer(conversationService.getConversationById(conversationId).getUser());
            appointment.setSlotPrice(slotInterval.getPrice()*slotsToBook);

            appointmentRepository.save(appointment);
            notificationService.addNotification(
                "You have booked "+slotsToBook+" slots for 1 hour period.you need to pay the money to confirm the booking or else it will be cancelled",
                conversationService.getConversationById(conversationId).getUser().getId(),appointment.getId(), "Complete Payment", business.getBusinessName());
            
            return "Successfully booked " + slotsToBook + " slot(s) at "+business.getBusinessName()+" .Pay the money to confirm or else it will be cancelled.Check 'Bookings' in your dashboard to find the bookings and complete payment";
        }

    }

    private String handleCheckCategory(String businessName) {
        return "(" + businessName + "):checkCategory";
    }

    private String handleCheckSlot(String params) {
        try {
            // Parse parameters (format: "downtown,Grand Hotel,2023-12-25T14:00:00")
            String[] parts = params.split(",");
            if (parts.length < 3) {
                return "Please provide all required information: area, business name, and date/time.";
            }

            String area = parts[0].equals("na") ? null : parts[0];
            String businessName = parts[1].equals("na") ? null : parts[1];
            String dateTimeStr = parts[2].equals("na") ? null : parts[2];

            // Validate inputs
            if (businessName == null || businessName.isBlank()) {
                return "Please provide a valid business name.";
            }
            if (dateTimeStr == null) {
                return "Please provide a valid date and time for knowing about available slots.";
            }

            LocalDateTime desiredDateTime;
            try {
                desiredDateTime = LocalDateTime.parse(dateTimeStr);
            } catch (Exception e) {
                return "The date format is incorrect. Please use format like: 2023-12-25T14:00:00";
            }

            // Check if business exists
            Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
            if (business == null) {
                return "The business '" + businessName + "' doesn't exist. Please check the name and try again.";
            }

            if (business.getApprovalStatus() == ApprovalStatus.PENDING) {
                return "The business '" + business.getBusinessName()
                        + "' is not approved yet. So you can't book an appointment with it through me. But I can give you the contact information of the business so that you can contact them and book an appointment with them directly.";

            }

            if (business.getApprovalStatus() == ApprovalStatus.REJECTED) {
                return "The business '" + business.getBusinessName()
                        + "' has been rejected. So you can't book an appointment with it through me and no informations can be provided about it for security purposes. Sorry for the incovenience";
            }

            // Check if location exists for this business
            List<BusinessLocation> locations = business.getLocations();
            if (locations == null || locations.isEmpty()) {
                return "The business '" + businessName + "' doesn't have any locations registered yet.";
            }

            // Find matching location by area (if provided)
            // Optional<BusinessLocation> matchingLocation = locations.stream()
            // .filter(loc -> area == null ||
            // (loc.getArea() != null && loc.getArea().equalsIgnoreCase(area)))
            // .findFirst();
            Optional<BusinessLocation> matchingLocation = businessLocationRepository
                    .findOneByBusinessIdAndKeyword(business.getId(), area);
            if (!matchingLocation.isPresent()) {
                String locationMessage = area == null
                        ? "Please specify which location you're interested in. Available locations: " +
                                locations.stream()
                                        .map(loc -> loc.getArea() + " (" + loc.getAddress() + ")")
                                        .collect(Collectors.joining(", "))
                        : "No location found in area '" + area + "'. Available areas: " +
                                locations.stream()
                                        .map(BusinessLocation::getArea)
                                        .filter(a -> a != null && !a.isEmpty())
                                        .collect(Collectors.joining(", "));
                return locationMessage;
            }

            BusinessLocation location = matchingLocation.get();
            if (businessHoursRepository.findByBusinessId(business.getId()).isEmpty()) {
                return "The business has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contact them using the contact information provided in the business profile.";
            }
            int dayOfWeek = desiredDateTime.toLocalDate().getDayOfWeek().getValue() % 7;
            BusinessHours businessHours = businessHoursRepository
                    .findByBusinessIdAndDayOfWeek(business.getId(), dayOfWeek)
                    .orElse(null);

            if (businessHours == null || businessHours.getIsClosed()) {
                return "The business is closed on this day. Please choose another day to check availability.";
            }
            LocalTime openTime = businessHours.getOpenTime();
            LocalTime closeTime = businessHours.getCloseTime();
            LocalTime desiredTime = desiredDateTime.toLocalTime();
            if (desiredTime.isBefore(openTime) || desiredTime.isAfter(closeTime)) {
                return "The business is closed at this time. It is open from " + openTime + " to " + closeTime
                        + ". Please choose a time within these hours.";
            }

            if (businessHours.getOpenTime() == null || businessHours.getCloseTime() == null) {
                return "The business has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contact them using the contact information provided in the business profile.";
            }

            // Check slot availability (using your repository method)
            int availableSlots = slotIntervalRepository.getAvailableSlotsCount(
                    location.getId(),
                    desiredDateTime);

            if (availableSlots <= 0) {
                return "Sorry, there are no available slots at " + location.getArea() +
                        " for " + desiredDateTime.toLocalDate() + " at " +
                        desiredDateTime.toLocalTime() + ". Would you like to try a different time?";
            } else {
                return "There are " + availableSlots + " available slot(s) at " +
                        location.getArea() + " for " + desiredDateTime.toLocalDate() +
                        " at " + desiredDateTime.toLocalTime() + ". Would you like to book one? " +
                        "Just say 'Book X slots at business named " + businessName + " location " + location.getArea() +
                        " on " + desiredDateTime.toLocalDate() + " at " +
                        desiredDateTime.toLocalTime() + "'";
            }

        } catch (Exception e) {
            log.error("Error checking slots", e);
            return "Sorry, I encountered an error checking availability. Please try again later.";
        }
    }

    private String handleLocationCheck(String businessName) {
        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "Sorry,There is no business with this name registered in our system. Please tell me if you need more help.";
        }
        List<BusinessLocation> locations = business.getLocations();
        if (locations == null || locations.isEmpty()) {
            return "The business '" + business.getBusinessName() + "' doesn't have any locations registered yet.";

        }
        String locationDetails = locations.stream()
                .map(loc -> loc.getArea() + ", " + loc.getCity() + ", " + loc.getAddress())
                .collect(Collectors.joining("; "));
        return "The business " + business.getBusinessName() + " is located at " + locationDetails
                + ". If you want to book an appointment with this business, please provide the date and time.";

    }

    private void saveConversationMessages(AIConversation conversation,
            String userPrompt,
            String aiResponse) {
        try {
            // Save user message
            AIMessage userMessage = new AIMessage();
            userMessage.setConversation(conversation);
            userMessage.setUserMessage(userPrompt);
            userMessage.setAiReply(aiResponse);
            userMessage.setCreatedAt(LocalDateTime.now());
            messageService.saveMessage(userMessage);

            // Update conversation last activity
            conversation.setLastActivity(LocalDateTime.now());
            conversationService.updateConversation(conversation);
        } catch (Exception e) {
            log.error("Error saving conversation messages", e);
        }
    }
}