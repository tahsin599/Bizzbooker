package com.tahsin.backend.Service;

import com.tahsin.backend.dto.SearchResultDTO;
import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.SearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SearchService {

    @Autowired
    private SearchRepository searchRepository;

    public List<SearchResultDTO> searchAll(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Long> businessIds = new HashSet<>(); // Track unique business IDs
        List<SearchResultDTO> results = new ArrayList<>();
        
        // Search businesses
        searchRepository.searchBusinesses(query, pageable).getContent()
            .forEach(b -> {
                if (!businessIds.contains(b.getId())) {
                    businessIds.add(b.getId());
                    results.add(new SearchResultDTO(
                        b.getId(),
                        b.getBusinessName(),
                        "business",
                        b.getLocations() != null && !b.getLocations().isEmpty() ? 
                            b.getLocations().get(0).getArea() : null,
                        b.getLocations() != null && !b.getLocations().isEmpty() ? 
                            b.getLocations().get(0).getCity() : null,
                        b.getImageData()
                    ));
                }
            });
        
        // Search locations
        searchRepository.searchLocations(query, pageable).getContent()
            .forEach(l -> {
                if (l.getBusiness() != null && !businessIds.contains(l.getBusiness().getId())) {
                    businessIds.add(l.getBusiness().getId());
                    results.add(new SearchResultDTO(
                        l.getBusiness().getId(),
                        l.getBusiness().getBusinessName(),
                        "business", // Changed from "location" to "business" since we're showing the business
                        l.getArea(),
                        l.getCity(),
                        l.getBusiness().getImageData()
                    ));
                }
            });
        
        // Search categories (no changes as they can't be duplicates)
        searchRepository.searchCategories(query, pageable).getContent()
            .forEach(c -> results.add(new SearchResultDTO(
                c.getId(),
                c.getName(),
                "category",
                null,
                null,
                null
            )));
        
        return results;
    }
}