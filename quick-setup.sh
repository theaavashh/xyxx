#!/bin/bash

echo "🛍️  Distributor Setup - Quick Start"
echo "=================================="
echo ""

# Check if npm dependencies are available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing required dependencies..."
npm install axios colors

echo ""
echo "🚀 Starting distributor setup..."
echo ""

# Make sure distributor API is running
echo "📋 Make sure distributor API is running on http://localhost:4444"
echo "   cd distributor-api && npm run dev"
echo ""

# Run the setup script
node setup-distributor.js