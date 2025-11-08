import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Upload, User, Building, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const Apply: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Organization Info
    organizationName: '',
    organizationType: '',
    university: '',
    establishedYear: '',
    memberCount: '',
    
    // Contact Person
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    position: '',
    
    // Additional Info
    description: '',
    website: '',
    socialMedia: '',
    
    // Documents
    registrationDoc: null,
    leadershipProof: null,
    universityAffiliation: null
  });

  const steps = [
    { number: 1, title: 'Organization Details', icon: Building },
    { number: 2, title: 'Contact Information', icon: User },
    { number: 3, title: 'Additional Information', icon: FileText },
    { number: 4, title: 'Document Upload', icon: Upload },
    { number: 5, title: 'Review & Submit', icon: CheckCircle }
  ];

  const organizationTypes = [
    'Student Association',
    'Academic Society',
    'Professional Club',
    'Cultural Association',
    'Sports Club',
    'Religious Organization',
    'Special Interest Group',
    'Other'
  ];

  const universities = [
    'University of Ghana',
    'Kwame Nkrumah University of Science and Technology',
    'University of Cape Coast',
    'Ghana Institute of Management and Public Administration',
    'Ashesi University',
    'University of Professional Studies',
    'Central University',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [e.target.name]: file
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast.success('Application submitted successfully! We\'ll review it within 24 hours and get back to you.');
    // Reset form or redirect
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">Organization Details</h3>
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-zinc-800 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                required
                value={formData.organizationName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., Engineering Students Association"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="organizationType" className="block text-sm font-medium text-zinc-800 mb-2">
                  Organization Type *
                </label>
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select type</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-zinc-800 mb-2">
                  University *
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select university</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="establishedYear" className="block text-sm font-medium text-zinc-800 mb-2">
                  Year Established *
                </label>
                <input
                  type="number"
                  id="establishedYear"
                  name="establishedYear"
                  required
                  min="1900"
                  max="2025"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="2020"
                />
              </div>

              <div>
                <label htmlFor="memberCount" className="block text-sm font-medium text-zinc-800 mb-2">
                  Approximate Member Count *
                </label>
                <select
                  id="memberCount"
                  name="memberCount"
                  required
                  value={formData.memberCount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select range</option>
                  <option value="1-50">1-50 members</option>
                  <option value="51-100">51-100 members</option>
                  <option value="101-250">101-250 members</option>
                  <option value="251-500">251-500 members</option>
                  <option value="500+">500+ members</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-zinc-800 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-zinc-800 mb-2">
                  Position in Organization *
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., President, Secretary, Treasurer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-zinc-800 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                required
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="your.email@university.edu"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-zinc-800 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">Additional Information</h3>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-800 mb-2">
                Organization Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Briefly describe your organization's purpose, activities, and goals..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-zinc-800 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="https://your-organization.com"
              />
            </div>

            <div>
              <label htmlFor="socialMedia" className="block text-sm font-medium text-zinc-800 mb-2">
                Social Media Links (Optional)
              </label>
              <input
                type="text"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Instagram, Facebook, Twitter handles or links"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">Document Upload</h3>
            <p className="text-slate-600 mb-6">
              Please upload the following documents to verify your organization. All documents should be in PDF format and under 5MB.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="registrationDoc" className="block text-sm font-medium text-zinc-800 mb-2">
                  Organization Registration Document *
                </label>
                <input
                  type="file"
                  id="registrationDoc"
                  name="registrationDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Official registration or constitution document
                </p>
              </div>

              <div>
                <label htmlFor="leadershipProof" className="block text-sm font-medium text-zinc-800 mb-2">
                  Leadership Verification *
                </label>
                <input
                  type="file"
                  id="leadershipProof"
                  name="leadershipProof"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Document proving your leadership position (election results, appointment letter, etc.)
                </p>
              </div>

              <div>
                <label htmlFor="universityAffiliation" className="block text-sm font-medium text-zinc-800 mb-2">
                  University Affiliation Proof *
                </label>
                <input
                  type="file"
                  id="universityAffiliation"
                  name="universityAffiliation"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Letter from university recognizing your organization or student ID
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">Review & Submit</h3>
            
            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-zinc-800">Organization Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {formData.organizationName}</div>
                <div><span className="font-medium">Type:</span> {formData.organizationType}</div>
                <div><span className="font-medium">University:</span> {formData.university}</div>
                <div><span className="font-medium">Established:</span> {formData.establishedYear}</div>
                <div><span className="font-medium">Members:</span> {formData.memberCount}</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-zinc-800">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {formData.contactName}</div>
                <div><span className="font-medium">Position:</span> {formData.position}</div>
                <div><span className="font-medium">Email:</span> {formData.contactEmail}</div>
                <div><span className="font-medium">Phone:</span> {formData.contactPhone}</div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
              <h4 className="font-semibold text-indigo-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• We'll review your application within 24 hours</li>
                <li>• You'll receive an email with the approval status</li>
                <li>• Once approved, you'll get access to your PayPoint dashboard</li>
                <li>• Our team will help you set up your first PayPoint</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-800 mb-6">
              Apply to PayPoint
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join hundreds of student associations already using PayPoint. The application process is simple and approval typically takes less than 24 hours.
            </p>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <div key={step.number} className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                        isActive ? 'border-indigo-600 text-indigo-600' :
                        'border-slate-300 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-indigo-600' : 'text-slate-500'
                        }`}>
                          Step {step.number}
                        </p>
                        <p className={`text-sm ${
                          isActive ? 'text-zinc-800' : 'text-slate-500'
                        }`}>
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 ml-6 ${
                          isCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 lg:p-12">
              <form onSubmit={currentStep === 5 ? handleSubmit : (e) => e.preventDefault()}>
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentStep === 1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Previous
                  </button>

                  {currentStep === 5 ? (
                    <button
                      type="submit"
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Submit Application
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Next
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Apply;
