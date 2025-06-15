#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://104.155.70.59:8080"

echo -e "${RED}⚡ HIGH VOLUME STRESS TEST${NC}"
echo -e "${YELLOW}Will send 5 iPhone orders quickly to trigger alert${NC}"
echo

for i in {1..5}; do
    echo -e "${GREEN}📱 Sending iPhone order $i/5${NC}"
    
    curl -s -X POST $API_BASE/orders \
        -H "Content-Type: application/json" \
        -d '{
            "product": "iPhone 14 Pro",
            "quantity": 1,
            "price": 999
        }' > /dev/null
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Order $i sent${NC}"
    else
        echo -e "${RED}❌ Order $i failed${NC}"
    fi
    
    # Small delay
    sleep 1
done

echo
echo -e "${YELLOW}🔔 Check analytics logs for HIGH VOLUME ALERT!${NC}"
echo -e "${BLUE}📊 Command: docker logs --follow kafkaquarkusngkfdf-order-analytics-service-1${NC}"

