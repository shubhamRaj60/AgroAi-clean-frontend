// Create Chart Utility Function
function createLineChart(ctx, label, borderColor, backgroundColor, yMax) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor,
        backgroundColor,
        tension: 0.4,
        pointRadius: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => `${label}: ${context.parsed.y}`
          }
        },
        legend: {
          display: true,
          labels: {
            font: {
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time' }
        },
        y: {
          min: 0,
          max: yMax,
          title: { display: true, text: label }
        }
      }
    }
  });
}

const chartColors = {
  moisture: "#27ae60",
  temperature: "#e67e22",
  tds: "#2980b9"
};

// Initialize Charts
const moistureChart = new Chart(document.getElementById('moistureChart'), {
  type: 'line',
  data: {
    labels: [], // your labels
    datasets: [{
      label: 'Soil Moisture (%)',
      data: [], // your data
      borderColor: "#27ae60",
      backgroundColor: "rgba(39,174,96,0.08)",
      pointBackgroundColor: "#27ae60",
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5,
      fill: true,
      pointStyle: 'circle'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#229954', font: { weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: '#229954',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        ticks: { color: '#229954' },
        grid: { color: '#eafaf1' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#229954' },
        grid: { color: '#eafaf1' }
      }
    }
  }
});

const tempChart = createLineChart(
  document.getElementById('temperatureChart').getContext('2d'),
  'Temperature (°C)',
  'red',
  'rgba(231, 76, 60, 0.2)',
  50
);

const tdsChart = createLineChart(
  document.getElementById('tdsChart').getContext('2d'),
  'TDS (ppm)',
  'blue',
  'rgba(52, 152, 219, 0.2)',
  2000
);

// User-selected limit (dropdown)
let maxEntries = 10;
const rangeSelector = document.getElementById('dataRange');
if (rangeSelector) {
  maxEntries = parseInt(rangeSelector.value);
  rangeSelector.addEventListener('change', () => {
    maxEntries = parseInt(rangeSelector.value);
  });
}

// Utility to update chart with limit
function updateChart(chart, value) {
  const timeLabel = new Date().toLocaleTimeString();
  if (chart.data.labels.length >= maxEntries) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(timeLabel);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// Firebase Initialization (already initialized in firebase-config.js)
const db = firebase.database();

// Real-time Listeners
db.ref('/AgroAI/Moisture').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(moistureChart, val);
});

db.ref('/AgroAI/Temperature').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(tempChart, val);
});

db.ref('/AgroAI/TDS').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(tdsChart, val);
});

function downloadChart(chartId) {
  const chart = document.getElementById(chartId);
  const link = document.createElement('a');
  link.href = chart.toDataURL('image/png');
  link.download = chartId + '.png';
  link.click();
}
