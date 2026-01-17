package com.example.theinterviewer.dto.credit;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditBalanceResponse {
    private Integer credits;
    private Integer freeInterviewsUsed;
    private Integer freeInterviewsRemaining;
}
