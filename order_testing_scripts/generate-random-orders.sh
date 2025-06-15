#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://104.155.70.59:8080"

# Your actual products with correct prices
declare -a PRODUCTS=(
    "iPhone 14 Pro:999"
    "MacBook Pro 16\":2499" 
    "AirPods Pro:249"
    "iPad Pro:1099"
    "Apple Watch Series 10:399"
    "HomePod mini:99"
    "Magic Keyboard:99"
    "AirTag (4-pack):99"
    "Apple TV 4K:179"
    "AirPods Max:549"
)

generate_order() {
    # Pick random product
    RANDOM_INDEX=$((RANDOM % ${#PRODUCTS[@]}))
    PRODUCT_INFO=${PRODUCTS[$RANDOM_INDEX]}
    
    # Split product info
    PRODUCT_NAME=$(echo $PRODUCT_INFO | cut -d':' -f1)
    PRODUCT_PRICE=$(echo $PRODUCT_INFO | cut -d':' -f2)
    
    # Random quantity (1-3)
    QUANTITY=$((RANDOM % 3 + 1))
    
    # Create order JSON
    ORDER_JSON=$(cat <<EOF
{
    "product": "$PRODUCT_NAME",
    "quantity": $QUANTITY,
    "price": $PRODUCT_PRICE
}
EOF
)
    
    echo -e "${BLUE}🛒 Creating order: ${GREEN}$QUANTITY x $PRODUCT_NAME${NC} @ ${YELLOW}\$$PRODUCT_PRICE${NC}"
    
    # Send order
    RESPONSE=$(curl -s -X POST $API_BASE/orders \
        -H "Content-Type: application/json" \
        -d "$ORDER_JSON")
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Order created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create order${NC}"
    fi
    
    echo "---"
}

echo -e "${YELLOW}🚀 Random Order Generator Started${NC}"
echo -e "${BLUE}📊 Will generate orders every 2-5 seconds${NC}"
echo -e "${BLUE}📡 Target: $API_BASE/orders${NC}"
echo "Press Ctrl+C to stop..."
echo

# Generate orders continuously
while true; do
    generate_order
    
    # Random delay between 2-5 seconds
    DELAY=$((RANDOM % 4 + 2))
    sleep $DELAY
done

