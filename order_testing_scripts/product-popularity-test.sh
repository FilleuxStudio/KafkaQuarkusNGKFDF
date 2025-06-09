#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://104.155.70.59:8080"

echo -e "${YELLOW}📊 Product Popularity Test${NC}"
echo -e "${BLUE}Creating mix of orders to generate analytics${NC}"
echo

# Create multiple orders for different products
declare -a TEST_ORDERS=(
    "iPhone 14 Pro:999:3"
    "MacBook Pro 16\":2499:1" 
    "AirPods Pro:249:2"
    "iPhone 14 Pro:999:2"
    "iPad Pro:1099:1"
    "iPhone 14 Pro:999:1"
)

for order_info in "${TEST_ORDERS[@]}"; do
    PRODUCT=$(echo $order_info | cut -d':' -f1)
    PRICE=$(echo $order_info | cut -d':' -f2)
    QUANTITY=$(echo $order_info | cut -d':' -f3)
    
    echo -e "${GREEN}🛒 $QUANTITY x $PRODUCT @ \$$PRICE${NC}"
    
    curl -s -X POST $API_BASE/orders \
        -H "Content-Type: application/json" \
        -d "{
            \"product\": \"$PRODUCT\",
            \"quantity\": $QUANTITY,
            \"price\": $PRICE
        }" > /dev/null
    
    sleep 2
done

echo
echo -e "${YELLOW}📈 Analytics should show:${NC}"
echo -e "${BLUE}• iPhone 14 Pro: 6 orders total${NC}"
echo -e "${BLUE}• High revenue for MacBook Pro${NC}"
echo -e "${BLUE}• Mixed activity across products${NC}"

