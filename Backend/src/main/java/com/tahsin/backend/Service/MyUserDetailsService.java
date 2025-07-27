package com.tahsin.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Model.UserPrincipal;


@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    UserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user=repo.findByUsername(username);
        if(user==null){
            System.out.println("user not found");
            throw new UsernameNotFoundException("Not found");
        }

        return new UserPrincipal(user);
    }

   

}

