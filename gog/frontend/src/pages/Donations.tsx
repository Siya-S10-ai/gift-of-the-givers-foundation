import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { donationsAPI } from '../services/api';
import { Donation } from '../types';

const Donations: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { id: 'Food', name: 'Food', icon: '🍽️', color: 'bg-orange-100 text-orange-800', description: 'Provide meals and food supplies to families in need' },
    { id: 'Clothing', name: 'Clothing', icon: '👕', color: 'bg-blue-100 text-blue-800', description: 'Donate clothing and essential items for all ages' },
    { id: 'Medical Supplies', name: 'Medical Supplies', icon: '🏥', color: 'bg-red-100 text-red-800', description: 'Support healthcare initiatives with medical supplies' },
    { id: 'Education', name: 'Education', icon: '📚', color: 'bg-green-100 text-green-800', description: 'Help children access quality education and learning materials' },
    { id: 'Water', name: 'Water', icon: '💧', color: 'bg-cyan-100 text-cyan-800', description: 'Provide clean water access to communities' },
    { id: 'Emergency Relief', name: 'Emergency Relief', icon: '🚨', color: 'bg-purple-100 text-purple-800', description: 'Support immediate disaster relief efforts' },
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Support For Flood Ravaged Pakistan',
      description: 'Help provide emergency relief to families affected by devastating floods',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      target: 50000,
      raised: 32000,
      category: 'Emergency Relief'
    },
    {
      id: 2,
      title: 'Rebuilding Flood-Stricken Communities In Eastern Cape',
      description: 'Support reconstruction efforts in communities devastated by floods',
      image: 'https://images.unsplash.com/photo-1574263867127-0b0b1b0b0b0b?w=400',
      target: 75000,
      raised: 45000,
      category: 'Emergency Relief'
    },
    {
      id: 3,
      title: 'Restoration Begins Amid Gaza Genocide',
      description: 'Provide humanitarian aid and support to affected families',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      target: 100000,
      raised: 78000,
      category: 'Emergency Relief'
    },
    {
      id: 4,
      title: 'Floods And Fires Wreak Havoc In South Africa',
      description: 'Emergency response to natural disasters affecting South African communities',
      image: 'https://images.unsplash.com/photo-1574263867127-0b0b1b0b0b0b?w=400',
      target: 60000,
      raised: 28000,
      category: 'Emergency Relief'
    },
    {
      id: 5,
      title: 'Support For Syria',
      description: 'Long-term humanitarian support for Syrian families and communities',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      target: 80000,
      raised: 55000,
      category: 'Emergency Relief'
    }
  ];

  const presetAmounts = [50, 100, 250, 500, 1000];

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDonations();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserDonations = async () => {
    if (!user?.userId) return;
    
    try {
      const data = await donationsAPI.getUserDonations(user.userId);
      setDonations(data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setDonationAmount(amount);
    }
  };

  const handleDonate = async (category: string, campaignTitle?: string) => {
    if (donationAmount <= 0) {
      setError('Please select or enter a donation amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // In a real implementation, this would integrate with Stripe/PayFast
      // For now, we'll simulate the payment process
      const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await donationsAPI.create({
        category,
        amount: donationAmount,
        transactionReference: transactionRef,
      });

      setSuccess(`Thank you for your donation of R${donationAmount.toFixed(2)}! Your contribution will make a difference.`);
      setDonationAmount(0);
      setCustomAmount('');
      
      if (isAuthenticated) {
        fetchUserDonations();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Make a Difference</h1>
        <p className="text-xl text-blue-100 mb-6">
          Your donation helps us provide humanitarian aid and disaster relief to communities in need.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">R2.5M+</div>
            <div className="text-sm text-blue-100">Raised This Year</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">15K+</div>
            <div className="text-sm text-blue-100">Lives Impacted</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-blue-100">Active Campaigns</div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Donation Categories */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Choose Your Cause</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.id}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedCategory === category.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Amount Selection */}
      {selectedCategory && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Select Donation Amount</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`py-3 px-4 rounded-md font-medium transition-colors ${
                  donationAmount === amount
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                R{amount}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                R
              </span>
              <input
                type="number"
                id="customAmount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total: {formatCurrency(donationAmount)}
            </div>
            <button
              onClick={() => handleDonate(selectedCategory)}
              disabled={isProcessing || donationAmount <= 0}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Donate Now'}
            </button>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Raised</span>
                    <span>{formatCurrency(campaign.raised)} of {formatCurrency(campaign.target)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory(campaign.category);
                    handleDonate(campaign.category, campaign.title);
                  }}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Support This Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Donations (if logged in) */}
      {isAuthenticated && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">My Donations</h2>
          
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💝</div>
              <p className="text-gray-500">No donations yet</p>
              <p className="text-sm text-gray-400">Make your first donation above to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.donationId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          categories.find(c => c.id === donation.category)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {donation.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(donation.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Transaction: {donation.transactionReference}
                      </div>
                    </div>
                    <div className="text-green-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust & Security */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure & Trusted</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>SSL Encrypted Payments</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>PCI Compliant Processing</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Tax Deductible Receipts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
