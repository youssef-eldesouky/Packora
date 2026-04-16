package com.packora.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Billing data required by Paymob when requesting a payment key.
 * All fields are mandatory — Paymob rejects requests with missing values.
 * Use "NA" as a safe fallback for optional fields.
 */
public class BillingData {

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("apartment")
    private String apartment = "NA";

    @JsonProperty("floor")
    private String floor = "NA";

    @JsonProperty("street")
    private String street;

    @JsonProperty("building")
    private String building = "NA";

    @JsonProperty("shipping_method")
    private String shippingMethod = "NA";

    @JsonProperty("postal_code")
    private String postalCode = "NA";

    @JsonProperty("city")
    private String city;

    @JsonProperty("country")
    private String country = "EG";

    @JsonProperty("state")
    private String state = "NA";

    // ── Constructors ─────────────────────────────────────────────────────────

    public BillingData() {}

    public BillingData(String firstName, String lastName, String email,
                       String phoneNumber, String street, String city) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.street = street;
        this.city = city;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getApartment() { return apartment; }
    public void setApartment(String apartment) { this.apartment = apartment; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getShippingMethod() { return shippingMethod; }
    public void setShippingMethod(String shippingMethod) { this.shippingMethod = shippingMethod; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
