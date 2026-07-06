let transactionCount = 0;
    const DEPLOYED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzT-SyKIREj-22sMRAp490NVwjFdBDGJ46zLTWeJqlBl9NepR-hCJ3IIqVKs9s5zkZIWw/exec";

    // --- Generate Bill Logic ---
    document.getElementById('billingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 1. Input Validation
        const nameInput = document.getElementById('customerName').value.trim();
        const consumptionInput = document.getElementById('consumption').value.trim();
        const customerType = document.getElementById('customerType').value;
        
        if (nameInput === "") {
            alert("Please enter a customer name.");
            return;
        }
        if (consumptionInput === "" || isNaN(consumptionInput) || parseFloat(consumptionInput) < 0) {
            alert("Please enter a valid, non-negative water consumption value.");
            return;
        }
        
        const consumption = parseFloat(consumptionInput);
        
        // 2. Loop & Conditional Control Structure to determine Rate Tier
        const rateTiers = [
            { limit: 20, rate: 25.00 },
            { limit: 40, rate: 35.00 },
            { limit: 60, rate: 45.00 },
            { limit: Infinity, rate: 60.00 }
        ];
        
        let ratePerCuM = 0;
        for (let i = 0; i < rateTiers.length; i++) {
            if (consumption <= rateTiers[i].limit) {
                ratePerCuM = rateTiers[i].rate;
                break;
            }
        }
        
        // Calculate Base Amount
        const amount = consumption * ratePerCuM;
        
        // 3. Switch Statement for Discounts
        let discountPercentage = 0;
        switch (customerType) {
            case "Senior Citizen":
                discountPercentage = 0.25;
                break;
            case "Solo Parent":
                discountPercentage = 0.15;
                break;
            case "Regular":
                discountPercentage = 0.00;
                break;
            default:
                discountPercentage = 0.00;
        }
        
        const discount = amount * discountPercentage;
        const totalBill = amount - discount;
        
        // 4. Update Transaction Counter
        transactionCount++;
        document.getElementById('transactionCounter').innerText = `Transactions Processed : ${transactionCount}`;
        
        // 5. Build Receipt Output
        const receiptText = 
`==============================
     WATER BILLING
==============================

Customer Name : ${nameInput}
Customer Type : ${customerType}
Water Usage   : ${consumption} cu.m
Rate          : ₱${ratePerCuM.toFixed(2)} / cu.m
------------------------------
Amount        : ₱${amount.toFixed(2)}
Discount      : ₱${discount.toFixed(2)}
------------------------------
TOTAL BILL    : ₱${totalBill.toFixed(2)}
==============================`;

        // Render to statement block using DOM methods
        document.getElementById('statementOutput').textContent = receiptText;
        
        // 6. Send Transaction Data to Google Sheets Backend
            const payload = {
            customerName: nameInput,
            consumption: consumption,
            customerType: customerType,
            rate: ratePerCuM,
            amount: amount,
            discount: discount,
            totalBill: totalBill
            };
            
            fetch(DEPLOYED_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                mode: "no-cors"
            })
            .then(() => console.log("Transaction successfully recorded to Google Sheets."))
            .catch(err => console.error("Error saving transaction: ", err));
    });

    // --- Reset Button Logic ---
    document.getElementById('resetBtn').addEventListener('click', function() {
        // Clear text inputs and reset dynamic dropdown selections
        document.getElementById('billingForm').reset();
        
        // Empty the rendered billing statement receipt box 
        document.getElementById('statementOutput').textContent = "";
    });