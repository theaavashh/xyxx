#!/bin/bash

# Define API URL
API_URL="http://localhost:4444/api"

# Create dummy images for testing if they don't exist
create_dummy_image() {
    if [ ! -f "$1" ]; then
        echo "Creating dummy image: $1"
        # Create a small valid JPG
        echo "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=" | base64 -d > "$1"
    fi
}

create_dummy_image "citizen_front.jpg"
create_dummy_image "citizen_back.jpg"
create_dummy_image "pan.jpg"
create_dummy_image "reg.jpg"
create_dummy_image "photo.jpg"
create_dummy_image "map.jpg"

# Prepare JSON data
# Note: The structure matches what the backend expects (JSON string in 'data' field)
DATA='{
  "personalDetails": {
    "fullName": "Test Distributor User",
    "age": 30,
    "gender": "पुरुष",
    "citizenshipNumber": "123-456-789",
    "issuedDistrict": "Kathmandu",
    "mobileNumber": "9800000000",
    "email": "test.distributor@example.com",
    "permanentAddress": "Kathmandu-10, Nepal",
    "temporaryAddress": "Lalitpur-5, Nepal"
  },
  "businessDetails": {
    "companyName": "Test Distributor Company",
    "registrationNumber": "REG-2024-001",
    "panVatNumber": "PAN-2024-001",
    "officeAddress": "Kathmandu-10",
    "operatingArea": "Bagmati, Kathmandu",
    "desiredDistributorArea": "Kathmandu Valley",
    "currentBusiness": "Retail",
    "businessType": "individual"
  },
  "staffInfrastructure": {
    "salesManCount": 2,
    "salesManExperience": "2 years",
    "deliveryStaffCount": 1,
    "deliveryStaffExperience": "1 year",
    "accountAssistantCount": 1,
    "accountAssistantExperience": "3 years",
    "otherStaffCount": 0,
    "warehouseSpace": 1000,
    "warehouseDetails": "Concrete building",
    "truckCount": 1,
    "truckDetails": "Tata Ace",
    "fourWheelerCount": 0,
    "twoWheelerCount": 2,
    "cycleCount": 0,
    "thelaCount": 0
  },
  "currentTransactions": [],
  "businessInformation": {
    "productCategory": "FMCG",
    "yearsInBusiness": 5,
    "monthlySales": "500000",
    "storageFacility": "Own Warehouse"
  },
  "retailerRequirements": {
    "preferredProducts": "All",
    "monthlyOrderQuantity": "100000",
    "paymentPreference": "Bank Transfer",
    "creditDays": 7,
    "deliveryPreference": "Delivery"
  },
  "declaration": {
    "declaration": true,
    "signature": "Test User",
    "date": "2024-02-04"
  },
  "agreement": {
    "agreementAccepted": true,
    "distributorSignatureName": "Test User",
    "distributorSignatureDate": "2024-02-04"
  }
}'

echo "Submitting application to $API_URL/applications/submit..."

# Submit application using curl
curl -X POST "$API_URL/applications/submit" \
  -F "data=$DATA" \
  -F "citizenshipId=@citizen_front.jpg" \
  -F "citizenshipBack=@citizen_back.jpg" \
  -F "panVatRegistration=@pan.jpg" \
  -F "companyRegistration=@reg.jpg" \
  -F "officePhoto=@photo.jpg" \
  -F "areaMap=@map.jpg" \
  -v

echo -e "\n\nSubmission attempt complete."
