package com.tahsin.backend.Controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.User;

@RestController
@RequestMapping("/oauth")
public class oauthController {

    @PostMapping("/register")
    public String oauth(@AuthenticationPrincipal OAuth2User principal){

        return "hello";
    }

}
