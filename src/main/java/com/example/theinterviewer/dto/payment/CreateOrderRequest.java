package com.example.theinterviewer.dto.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Credits amount is required")
    @Min(value = 25, message = "Minimum 25 credits required")
    private Integer credits;
}
