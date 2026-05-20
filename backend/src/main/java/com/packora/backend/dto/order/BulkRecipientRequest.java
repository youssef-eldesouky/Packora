package com.packora.backend.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * A single recipient row parsed from the bulk order Excel file.
 * Maps to the columns: Customer Name, Phone Number, Address Line, City, Notes.
 */
@Data
public class BulkRecipientRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address line is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String notes;
}
