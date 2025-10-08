export function initOverview(data) {
    if (!data || !data.overview) return;

    const stats = data.overview;
    
    document.getElementById('total-events').textContent = 
        stats.totalEvents?.toLocaleString() || '-';
    
    document.getElementById('high-risk-counties').textContent = 
        stats.highRiskCounties?.toLocaleString() || '-';
    
    document.getElementById('avg-igs').textContent = 
        stats.avgIGS?.toFixed(1) || '-';
    
    document.getElementById('total-damage').textContent = 
        stats.totalDamage ? `$${stats.totalDamage}B` : '-';
}

