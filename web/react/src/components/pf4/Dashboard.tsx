import * as React from 'react';
import { Link } from 'react-router-dom';
import { Grid, GridItem } from '@patternfly/react-core';
import { AngleDoubleLeftIcon } from '@patternfly/react-icons';

import { AllPromLabelsValues } from '../../types/Labels';
import { DashboardModel, ChartModel } from '../../types/Dashboards';
import { metricsDataSupplier, histogramDataSupplier } from '../../utils/victoryChartsUtils';
import KChart from './KChart';

const expandedChartContainerStyle: React.CSSProperties = {
  height: 'calc(100vh - 248px)'
};

const expandedChartBackLinkStyle: React.CSSProperties = {
  marginTop: '-1.7em',
  textAlign: 'right'
};

type DashboardProps = {
  dashboard: DashboardModel;
  labelValues: AllPromLabelsValues;
};

export class Dashboard extends React.Component<DashboardProps, {}> {
  constructor(props: DashboardProps) {
    super(props);
  }

  render() {
    const urlParams = new URLSearchParams(window.location.search);
    const expandedChart = urlParams.get('expand');
    urlParams.delete('expand');
    const notExpandedLink = window.location.pathname + '?' + urlParams.toString();

    return (
      <div>
        {expandedChart && (
          <h3 style={expandedChartBackLinkStyle}>
            <Link to={notExpandedLink}>
              <AngleDoubleLeftIcon /> View all metrics
            </Link>
          </h3>
        )}
        {expandedChart ? this.renderExpandedChart(expandedChart) : this.renderMetrics()}
      </div>
    );
  }

  renderMetrics() {
    return (
      <Grid>{this.props.dashboard.charts.map(c => this.renderChartCard(c))}</Grid>
    );
  }

  private renderExpandedChart(chartKey: string) {
    const chart = this.props.dashboard.charts.find(c => c.name === chartKey);
    if (chart) {
      return <div style={expandedChartContainerStyle}>{this.renderChart(chart)}</div>;
    }
    return undefined;
  }

  private renderChartCard(chart: ChartModel) {
    return (
      <GridItem span={chart.spans} key={chart.name}>
        {this.renderChart(chart, () => this.onExpandHandler(chart.name))}
      </GridItem>
    );
  }

  private renderChart(chart: ChartModel, expandHandler?: () => void) {
    if (chart.metric) {
      return (
        <KChart
          key={chart.name}
          chartName={chart.name}
          unit={chart.unit}
          dataSupplier={metricsDataSupplier(chart.name, chart.metric, this.props.labelValues)}
          onExpandRequested={expandHandler}
        />
      );
    } else if (chart.histogram) {
      return (
        <KChart
          key={chart.name}
          chartName={chart.name}
          unit={chart.unit}
          dataSupplier={histogramDataSupplier(chart.histogram, this.props.labelValues)}
          onExpandRequested={expandHandler}
        />
      );
    }
    return undefined;
  }

  private onExpandHandler = (chartKey: string): void => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('expand', chartKey);
    window.history.pushState({}, '', window.location.pathname + '?' + urlParams.toString());
  };
}
