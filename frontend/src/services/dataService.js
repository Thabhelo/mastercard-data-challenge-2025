import Papa from 'papaparse';

class DataService {
  constructor() {
    this.data = null;
    this.processedData = null;
  }

  async loadData() {
    try {
      const response = await fetch('/data/igs_talladega_tracts.csv');
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.data = results.data;
            this.processedData = this.processData(results.data);
            resolve(this.processedData);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  processData(rawData) {
    return rawData.map(row => ({
      ...row,
      Year: parseInt(row.Year) || 0,
      'Inclusive Growth Score': parseFloat(row['Inclusive Growth Score']) || 0,
      'Growth': parseFloat(row['Growth']) || 0,
      'Inclusion': parseFloat(row['Inclusion']) || 0,
      'Place': parseFloat(row['Place']) || 0,
      'Economy': parseFloat(row['Economy']) || 0,
      'Community': parseFloat(row['Community']) || 0,
      'Place Growth': parseFloat(row['Place Growth']) || 0,
      'Place Inclusion': parseFloat(row['Place Inclusion']) || 0,
      'Economy Growth': parseFloat(row['Economy Growth']) || 0,
      'Economy Inclusion': parseFloat(row['Economy Inclusion']) || 0,
      'Community Growth': parseFloat(row['Community Growth']) || 0,
      'Community Inclusion': parseFloat(row['Community Inclusion']) || 0,
      'Tract Label': `Tract ${row['Census Tract FIPS code']}`,
      'Opportunity Zone': row['Is an Opportunity Zone'] === 'Yes'
    }));
  }

  getData() {
    return this.processedData;
  }

  getTracts() {
    if (!this.processedData) return [];
    return [...new Set(this.processedData.map(d => d['Census Tract FIPS code']))].sort();
  }

  getYears() {
    if (!this.processedData) return [];
    return [...new Set(this.processedData.map(d => d.Year))].sort();
  }

  getMetrics() {
    return [
      { key: 'Inclusive Growth Score', label: 'Inclusive Growth Score' },
      { key: 'Growth', label: 'Growth' },
      { key: 'Inclusion', label: 'Inclusion' },
      { key: 'Place', label: 'Place' },
      { key: 'Economy', label: 'Economy' },
      { key: 'Community', label: 'Community' }
    ];
  }

  filterData(filters) {
    if (!this.processedData) return [];
    
    let filtered = this.processedData;
    
    if (filters.tract && filters.tract !== 'all') {
      filtered = filtered.filter(d => d['Census Tract FIPS code'] === filters.tract);
    }
    
    if (filters.yearRange) {
      filtered = filtered.filter(d => 
        d.Year >= filters.yearRange[0] && d.Year <= filters.yearRange[1]
      );
    }
    
    return filtered;
  }

  getLatestYearData(filters = {}) {
    const filtered = this.filterData(filters);
    const latestYear = Math.max(...filtered.map(d => d.Year));
    return filtered.filter(d => d.Year === latestYear);
  }

  getTimeSeriesData(filters = {}) {
    const filtered = this.filterData(filters);
    const tractGroups = {};
    
    filtered.forEach(d => {
      const tract = d['Census Tract FIPS code'];
      if (!tractGroups[tract]) {
        tractGroups[tract] = [];
      }
      tractGroups[tract].push(d);
    });
    
    return tractGroups;
  }

  getSummaryStats(filters = {}) {
    const latestData = this.getLatestYearData(filters);
    if (latestData.length === 0) return null;
    
    const metric = filters.metric || 'Inclusive Growth Score';
    const values = latestData.map(d => d[metric]).filter(v => !isNaN(v));
    
    if (values.length === 0) return null;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate year-over-year change
    const currentYear = Math.max(...latestData.map(d => d.Year));
    const prevYearData = this.filterData({
      ...filters,
      yearRange: [currentYear - 1, currentYear - 1]
    });
    
    let yoyChange = 0;
    if (prevYearData.length > 0) {
      const prevValues = prevYearData.map(d => d[metric]).filter(v => !isNaN(v));
      if (prevValues.length > 0) {
        const prevAvg = prevValues.reduce((a, b) => a + b, 0) / prevValues.length;
        yoyChange = avg - prevAvg;
      }
    }
    
    return {
      average: avg,
      max,
      min,
      yoyChange,
      totalTracts: latestData.length,
      opportunityZones: latestData.filter(d => d['Opportunity Zone']).length
    };
  }
}

export default new DataService();

