package com.example.theinterviewer.dto.credit;

import com.example.theinterviewer.entity.CreditTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransactionDTO {
    private Long id;
    private Integer creditChange;
    private Integer balanceAfter;
    private CreditTransaction.TransactionType type;
    private String description;
    private LocalDateTime timestamp;
}
