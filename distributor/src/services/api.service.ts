import { Category } from '../types/formTypes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api';

export const apiService = {
  // Transform frontend form data to backend schema
  transformFormDataForBackend(applicationData: any) { // Using any since the transformation involves complex mapping
    console.log('Transforming application data:', applicationData);
    console.log('fullName value:', applicationData.fullName);
    console.log('personalDetails before:', {
      fullName: applicationData.fullName,
      age: applicationData.age,
      gender: applicationData.gender,
      citizenshipNumber: applicationData.citizenshipNumber,
      issuedDistrict: applicationData.issuedDistrict,
    });
    
    const transformed = {
      personalDetails: {
        fullName: applicationData.fullName || '',
        age: applicationData.age ? parseInt(applicationData.age) : 18,
        gender: applicationData.gender || 'पुरुष',
        citizenshipNumber: applicationData.citizenshipNumber || '',
        issuedDistrict: applicationData.issuedDistrict || '',
        mobileNumber: applicationData.mobileNumber || applicationData.contactNumber || '',
        email: applicationData.email || '',
        permanentAddress: applicationData.permanentAddress || '',
        temporaryAddress: applicationData.temporaryAddress || '',
      },
      businessDetails: {
        companyName: applicationData.companyName || '',
        registrationNumber: applicationData.registrationNumber || '',
        panVatNumber: applicationData.panVatNumber || '',
        officeAddress: applicationData.officeAddress || '',
        operatingArea: `${applicationData.workAreaProvince || ''}, ${applicationData.workAreaDistrict || ''}`,
        desiredDistributorArea: applicationData.desiredDistributionArea || '',
        currentBusiness: applicationData.businessType || '',
        businessType: applicationData.businessStructure || 'individual',
      },
      staffInfrastructure: {
        salesManCount: applicationData.selectedStaffType === 'salesman' ? applicationData.staffQuantity || 0 : 0,
        salesManExperience: applicationData.selectedStaffType === 'salesman' ? applicationData.infrastructureQuantity?.toString() || '' : '',
        deliveryStaffCount: applicationData.selectedStaffType === 'delivery-staff' ? applicationData.staffQuantity || 0 : 0,
        deliveryStaffExperience: applicationData.selectedStaffType === 'delivery-staff' ? applicationData.infrastructureQuantity?.toString() || '' : '',
        accountAssistantCount: applicationData.selectedStaffType === 'account-assistant' ? applicationData.staffQuantity || 0 : 0,
        accountAssistantExperience: applicationData.selectedStaffType === 'account-assistant' ? applicationData.infrastructureQuantity?.toString() || '' : '',
        otherStaffCount: applicationData.selectedStaffType === 'other' ? applicationData.staffQuantity || 0 : 0,
        otherStaffExperience: applicationData.selectedStaffType === 'other' ? applicationData.infrastructureQuantity?.toString() || '' : '',
        warehouseSpace: applicationData.selectedInfrastructureType === 'warehouse' ? applicationData.infrastructureQuantity || 0 : 0,
        warehouseDetails: applicationData.selectedInfrastructureType === 'warehouse' ? applicationData.storageFacility || '' : '',
        truckCount: applicationData.selectedInfrastructureType === 'transport' ? applicationData.infrastructureQuantity || 0 : 0,
        truckDetails: applicationData.selectedInfrastructureType === 'transport' ? applicationData.storageFacility || '' : '',
        fourWheelerCount: 0,
        fourWheelerDetails: '',
        twoWheelerCount: 0,
        twoWheelerDetails: '',
        cycleCount: 0,
        cycleDetails: '',
        thelaCount: 0,
        thelaDetails: '',
      },
      currentTransactions: applicationData.currentTransactions || [],
      businessInformation: {
        productCategory: applicationData.productCategory || '',
        yearsInBusiness: applicationData.businessExperience ? parseInt(applicationData.businessExperience) : 1,
        monthlySales: applicationData.monthlyIncome || '0',
        storageFacility: applicationData.storageFacility || '',
      },
      retailerRequirements: {
        preferredProducts: applicationData.productCategory || '',
        monthlyOrderQuantity: '0',
        paymentPreference: applicationData.paymentPreference || 'नगद',
        creditDays: applicationData.creditDays ? parseInt(applicationData.creditDays) : 0,
        deliveryPreference: applicationData.deliveryPreference || 'स्वयं उठाउने',
      },
      partnershipDetails: applicationData.businessStructure === 'partnership' ? {
        partnerFullName: applicationData.partnerFullName || '',
        partnerAge: applicationData.partnerAge || '',
        partnerGender: applicationData.partnerGender || 'पुरुष',
        partnerCitizenshipNumber: applicationData.partnerCitizenshipNumber || '',
        partnerIssuedDistrict: applicationData.partnerIssuedDistrict || '',
        partnerMobileNumber: applicationData.partnerMobileNumber || '',
        partnerEmail: applicationData.partnerEmail || '',
        partnerPermanentAddress: applicationData.partnerPermanentAddress || '',
        partnerTemporaryAddress: applicationData.partnerTemporaryAddress || '',
      } : null,
      additionalInformation: {
        additionalInfo1: applicationData.additionalInfo || '',
        additionalInfo2: applicationData.additionalInfo2 || '',
        additionalInfo3: applicationData.additionalInfo3 || '',
      },
      areaCoverageDetails: applicationData.areaCoverageDetails || [],
      productsToDistribute: applicationData.products || [],
      declaration: {
        declaration: applicationData.agreementAccepted === true,
        signature: applicationData.distributorSignatureName || applicationData.fullName || '',
        date: applicationData.distributorSignatureDate || '',
      },
      agreement: {
        agreementAccepted: applicationData.agreementAccepted === true,
        distributorSignatureName: applicationData.distributorSignatureName || applicationData.fullName || '',
        distributorSignatureDate: applicationData.distributorSignatureDate || '',
      }
    };
    
    console.log('Transformed data:', transformed);
    console.log('personalDetails.fullName:', transformed.personalDetails.fullName);
    
    return transformed;
  },

  // Submit application
  async submitApplication(applicationData: any, files: any) { // Using any for flexibility with form data and files
    // Transform the frontend form data to match backend schema
    const transformedData = this.transformFormDataForBackend(applicationData);
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(transformedData));

    // Add files if they exist
    if (files && files.citizenshipFrontFile) {
      const file = files.citizenshipFrontFile instanceof FileList
        ? files.citizenshipFrontFile[0]
        : files.citizenshipFrontFile;
      if (file) formData.append('citizenshipId', file);
    }
    if (files && files.citizenshipBackFile) {
      const file = files.citizenshipBackFile instanceof FileList
        ? files.citizenshipBackFile[0]
        : files.citizenshipBackFile;
      if (file) formData.append('citizenshipBack', file);
    }
    if (files && files.panDocument) {
      const file = files.panDocument instanceof FileList
        ? files.panDocument[0]
        : files.panDocument;
      if (file) formData.append('panVatRegistration', file);
    }
    if (files && files.registrationDocument) {
      const file = files.registrationDocument instanceof FileList
        ? files.registrationDocument[0]
        : files.registrationDocument;
      if (file) formData.append('companyRegistration', file);
    }
    if (files && files.officePhotoFile) {
      const file = files.officePhotoFile instanceof FileList
        ? files.officePhotoFile[0]
        : files.officePhotoFile;
      if (file) formData.append('officePhoto', file);
    }
    if (files && files.otherDocumentsFile) {
      const file = files.otherDocumentsFile instanceof FileList
        ? files.otherDocumentsFile[0]
        : files.otherDocumentsFile;
      if (file) formData.append('areaMap', file);
    }

    try {
      const response = await fetch(`${API_URL}/applications/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Server error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = await response.text() || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Save draft application
  async saveDraft(applicationData: any, files: any) { // Using any for flexibility with form data and files
    // Transform the frontend form data to match backend schema
    const transformedData = this.transformFormDataForBackend(applicationData);
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(transformedData));

    // Add document files if they exist
    if (files && files.panDocument) {
      const file = files.panDocument instanceof FileList
        ? files.panDocument[0]
        : files.panDocument;
      if (file) formData.append('panVatRegistration', file);
    }
    
    if (files && files.registrationDocument) {
      const file = files.registrationDocument instanceof FileList
        ? files.registrationDocument[0]
        : files.registrationDocument;
      if (file) formData.append('companyRegistration', file);
    }
    
    if (files && files.citizenshipFrontFile) {
      const file = files.citizenshipFrontFile instanceof FileList
        ? files.citizenshipFrontFile[0]
        : files.citizenshipFrontFile;
      if (file) formData.append('citizenshipId', file);
    }
    if (files && files.citizenshipBackFile) {
      const file = files.citizenshipBackFile instanceof FileList
        ? files.citizenshipBackFile[0]
        : files.citizenshipBackFile;
      if (file) formData.append('citizenshipBack', file);
    }
    if (files && files.officePhotoFile) {
      const file = files.officePhotoFile instanceof FileList
        ? files.officePhotoFile[0]
        : files.officePhotoFile;
      if (file) formData.append('officePhoto', file);
    }
    if (files && files.otherDocumentsFile) {
      const file = files.otherDocumentsFile instanceof FileList
        ? files.otherDocumentsFile[0]
        : files.otherDocumentsFile;
      if (file) formData.append('areaMap', file);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444'}/api/applications/draft`, {
      method: 'POST',
      body: formData,
    });

    return response;
  },

  // Load application by reference number
  async loadApplicationByReference(refNumber: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444'}/api/applications/reference/${refNumber}`);
    return response;
  },

  // Fetch categories
  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Parse categories and create subcategories from description
          const categoriesWithSubcategories = data.data.flatMap((category: any) => {
            const result = [{ 
              id: category.id, 
              title: category.title,
              type: 'category' as const,
              parentId: null
            }];
            
            // Parse description for subcategories
            if (category.description) {
              const subcategories = category.description
                .split(',')
                .map((sub: any) => sub.trim())
                .filter((sub: any) => sub.length > 0)
                .map((sub: any, index: number) => ({
                  id: `${category.id}_sub_${index}`,
                  title: sub,
                  type: 'subcategory' as const,
                  parentId: category.id
                }));
              
              result.push(...subcategories);
            }
            
            return result;
          });
          
          return categoriesWithSubcategories;
        }
      }
      
      return [];
    } catch (error) {
      console.warn('Error fetching categories:', error);
      return [];
    }
  }
};