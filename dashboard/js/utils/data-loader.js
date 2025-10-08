export async function loadData() {
    const files = [
        'overview-stats.json',
        'county-risk.json',
        'time-series.json',
        'vulnerability.json'
    ];

    try {
        const data = await Promise.all(
            files.map(file => fetch(`data/${file}`).then(r => r.json()))
        );

        return {
            overview: data[0],
            countyRisk: data[1],
            timeSeries: data[2],
            vulnerability: data[3]
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return getMockData();
    }
}

function getMockData() {
    return {
        overview: {
            totalEvents: 12543,
            highRiskCounties: 87,
            avgIGS: 56.3,
            totalDamage: 45.2
        },
        countyRisk: [],
        timeSeries: [],
        vulnerability: []
    };
}

