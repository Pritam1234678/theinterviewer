package com.example.theinterviewer.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRankResponse {
    private int rank;
    private int totalUsers;
    private double userScore;
}
