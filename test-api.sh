#!/bin/bash

# Script de test de l'API User
# Usage: ./test-api.sh

API_URL="http://localhost:3000"

echo "================================"
echo "🧪 Tests de l'API User"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "📍 Test 1: Health Check"
echo "GET $API_URL/health"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" $API_URL/health)
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 200, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

# Test 2: Créer un utilisateur valide
echo "📍 Test 2: Créer un utilisateur valide"
echo "POST $API_URL/user"
echo "Body: {\"email\":\"test@example.com\",\"password\":\"ValidPass123\"}"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}')
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 201 ]; then
  echo -e "${GREEN}✓ Success (201 Created)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${YELLOW}⚠ Possible duplicate (Expected 201, got $http_status)${NC}"
  echo "$body" | jq '.'
fi
echo ""
echo "================================"
echo ""

# Test 3: Créer un utilisateur avec email invalide
echo "📍 Test 3: Email invalide"
echo "POST $API_URL/user"
echo "Body: {\"email\":\"invalid-email\",\"password\":\"ValidPass123\"}"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/user \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"ValidPass123"}')
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 400 ]; then
  echo -e "${GREEN}✓ Success (400 Bad Request)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 400, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

# Test 4: Créer un utilisateur avec mot de passe faible
echo "📍 Test 4: Mot de passe faible"
echo "POST $API_URL/user"
echo "Body: {\"email\":\"test2@example.com\",\"password\":\"weak\"}"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"weak"}')
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 400 ]; then
  echo -e "${GREEN}✓ Success (400 Bad Request)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 400, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

# Test 5: Créer un utilisateur avec mot de passe sans majuscule
echo "📍 Test 5: Mot de passe sans majuscule"
echo "POST $API_URL/user"
echo "Body: {\"email\":\"test3@example.com\",\"password\":\"lowercase123\"}"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@example.com","password":"lowercase123"}')
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 400 ]; then
  echo -e "${GREEN}✓ Success (400 Bad Request)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 400, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

# Test 6: Créer un doublon (email déjà existant)
echo "📍 Test 6: Doublon d'email"
echo "POST $API_URL/user"
echo "Body: {\"email\":\"test@example.com\",\"password\":\"ValidPass123\"}"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}')
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 409 ]; then
  echo -e "${GREEN}✓ Success (409 Conflict)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 409, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

# Test 7: Route inexistante (404)
echo "📍 Test 7: Route inexistante"
echo "GET $API_URL/nonexistent"
echo ""
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" $API_URL/nonexistent)
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" -eq 404 ]; then
  echo -e "${GREEN}✓ Success (404 Not Found)${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Failed (Expected 404, got $http_status)${NC}"
  echo "$body"
fi
echo ""
echo "================================"
echo ""

echo "🎉 Tests terminés !"
