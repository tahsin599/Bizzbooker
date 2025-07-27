// SearchController.java
package com.tahsin.backend.Controller;

import com.tahsin.backend.dto.SearchResultDTO;
import com.tahsin.backend.Service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<List<SearchResultDTO>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        List<SearchResultDTO> results = searchService.searchAll(query, page, size);
        return ResponseEntity.ok(results);
    }
}