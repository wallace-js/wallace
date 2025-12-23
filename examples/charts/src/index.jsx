import { mount, watch } from "wallace";

const buildChart = (ctx, data) => {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: data.label,
          data: data.values,
          borderWidth: 1,
          maxBarThickness: 40
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const ChartCanvas = ({ label }) => (
  <div>
    <canvas ref:canvas id={label}></canvas>
  </div>
);

ChartCanvas.methods = {
  render(props) {
    this.props = this.sortData(props);
    this.update();
    // The canvas isn't attached to the DOM yet, so we use a crude timeout.
    setTimeout(() => {
      buildChart(this.refs.canvas, this.props);
    }, 100);
  },
  sortData(data) {
    const newData = { label: data.label, labels: [], values: [] };
    const arrayOfObj = data.labels.map((d, i) => ({
      label: d,
      value: data.values[i]
    }));
    arrayOfObj.sort((a, b) => a.value - b.value);
    arrayOfObj.forEach(d => {
      newData.labels.push(d.label);
      newData.values.push(d.value);
    });
    return newData;
  }
};

const ChartList = charts => (
  <div>
    <ChartCanvas.repeat items={charts} />
  </div>
);

ChartList.methods = {
  render(props) {
    this.props = getCharts(props);
    this.update();
  }
};

const getCharts = data => {
  const charts = {};
  for (const [framework, stats] of Object.entries(data)) {
    for (const [test, value] of Object.entries(stats)) {
      if (test !== "version") {
        if (!charts.hasOwnProperty(test)) {
          charts[test] = { labels: [], values: [], label: test };
        }
        charts[test].labels.push(framework);
        charts[test].values.push(value);
      }
    }
  }
  return Object.values(charts);
};

fetch("benchmark-data.json")
  .then(res => res.json())
  .then(data => {
    mount("main", ChartList, data);
  });
