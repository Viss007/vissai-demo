document.getElementById('demoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        reason: formData.get('reason'),
        action: formData.get('action'),
        lang: formData.get('lang')
    };
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Call the API
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        // Display result
        document.getElementById('responseData').textContent = JSON.stringify(result, null, 2);
        document.getElementById('result').style.display = 'block';
        
        // Also check health endpoint
        const healthResponse = await fetch('/api/healthz');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting request');
        
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Submit Request';
        submitBtn.disabled = false;
    }
});