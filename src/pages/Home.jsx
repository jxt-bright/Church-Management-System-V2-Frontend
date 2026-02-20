import React from 'react';
import Chart from 'react-apexcharts';


const Home = () => {

  const membersCount = 450;
  const workersCount = 65;
  const usersCount = 120;
  
  // Data for Charts
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Chart 1: Attendance (Adults, Youths, Children)
  const adultData = [150, 160, 155, 170, 165, 180, 175, 190, 185, 200, 195, 210];
  const youthData = [80, 85, 82, 90, 88, 95, 92, 100, 98, 105, 102, 110];
  const childrenData = [40, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70];

  // Chart 2: Financial/Sales Data (From the specific script in your EJS)
  const netProfitData = [44, 55, 57, 56, 61, 58, 63, 60, 66, 33, 0, 0];
  const revenueData = [76, 85, 101, 98, 87, 105, 91, 114, 94, 33, 0, 0];
  const cashFlowData = [35, 41, 36, 26, 45, 48, 52, 53, 41, 33, 0, 0];

  // Chart 3: Demographics Pie Chart
  const demographicData = [50, 60, 30, 40, 20, 25]; 

  // Chart 4: Offering
  const firstOfferingData = [1200, 1350, 1250, 1400, 1500, 1600, 1550, 1700, 1650, 1800, 1900, 2000];
  const secondOfferingData = [800, 900, 850, 950, 1000, 1100, 1050, 1150, 1100, 1200, 1250, 1300];




  // Attendance Over Time (Area Chart)
  const attendanceChartOptions = {
    chart: { type: 'area', height: 350, toolbar: { show: false } },
    colors: ['#0d6efd', '#20c997', '#FFD700'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: monthLabels },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => val } },
  };
  const attendanceChartSeries = [
    { name: 'ADULTS', data: adultData },
    { name: 'YOUTHS', data: youthData },
    { name: 'CHILDREN', data: childrenData },
  ];

  // Financial Bar Chart (Originally labeled Attendance in EJS, seemingly financial data)
  const financialChartOptions = {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    colors: ['#0d6efd', '#198754', '#ffc107'],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: monthLabels },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => '$ ' + val + ' thousands' } },
  };
  const financialChartSeries = [
    { name: 'Net Profit', data: netProfitData },
    { name: 'Revenue', data: revenueData },
    { name: 'Free Cash Flow', data: cashFlowData },
  ];

  // Demographics Pie Chart
  const pieChartOptions = {
    chart: { type: 'donut' },
    labels: ['Adult Males', 'Adult Females', 'Youth Males', 'Youth Females', 'Children Males', 'Children Females'],
    dataLabels: { enabled: false },
    colors: ['#0d6efd', '#20c997', '#ffc107', '#d63384', '#6f42c1', '#adb5bd'],
    legend: { position: 'bottom' }
  };
  const pieChartSeries = demographicData;

  // Offering Over Time
  const offeringChartOptions = {
    chart: { type: 'area', height: 500, toolbar: { show: false } },
    colors: ['#0d6efd', '#20c997'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: monthLabels },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => 'GHS ' + val } },
  };
  const offeringChartSeries = [
    { name: 'First Offering', data: firstOfferingData },
    { name: 'Second Offering', data: secondOfferingData },
  ];


  return (
    <div className="app-wrapper">
      
      <main className="app-main">
        {/* App Content Header */}
        <div className="app-content-header mb-4">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6">
                <h3 className="mb-0">Home</h3>
              </div>
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="app-content">
          <div className="container-fluid">
            
            {/* Small Boxes Row */}
            <div className="row">
              {/* Total Members */}
              <div className="col-lg-3 col-6">
                <div className="small-box text-bg-primary p-3 rounded mb-4 position-relative">
                  <div className="inner">
                    <h3>{membersCount}</h3>
                    <p>Total Members</p>
                  </div>
                  <div className="icon position-absolute top-0 end-0 p-3 opacity-25">
                    <svg fill="currentColor" width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"></path>
                    </svg>
                  </div>
                  <a href="/member/memberstable" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover d-block mt-2">
                    More info <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>

              {/* Number Of Workers */}
              <div className="col-lg-3 col-6">
                <div className="small-box text-bg-success p-3 rounded mb-4 position-relative">
                  <div className="inner">
                    <h3>{workersCount}<sup className="fs-5"></sup></h3>
                    <p>Number Of Workers</p>
                  </div>
                  <div className="icon position-absolute top-0 end-0 p-3 opacity-25">
                    <svg fill="currentColor" width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"></path>
                    </svg>
                  </div>
                  <a href="/member/workerstable" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover d-block mt-2">
                    More info <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>

              {/* Total Users */}
              <div className="col-lg-3 col-6">
                <div className="small-box text-bg-warning p-3 rounded mb-4 position-relative">
                  <div className="inner">
                    <h3>{usersCount}</h3>
                    <p>Total Users</p>
                  </div>
                  <div className="icon position-absolute top-0 end-0 p-3 opacity-25">
                    <svg fill="currentColor" width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
                    </svg>
                  </div>
                  <a href="/user/userstable" className="small-box-footer link-dark link-underline-opacity-0 link-underline-opacity-50-hover d-block mt-2">
                    More info <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>

              {/* Unique Visitors */}
              <div className="col-lg-3 col-6">
                <div className="small-box text-bg-danger p-3 rounded mb-4 position-relative">
                  <div className="inner">
                    <h3>65</h3>
                    <p>Unique Visitors</p>
                  </div>
                  <div className="icon position-absolute top-0 end-0 p-3 opacity-25">
                  </div>
                  <a href="#" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover d-block mt-2">
                    More info <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row">
              
              {/* Attendance Chart (Adults/Youth/Child) */}
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-header" style={{ cursor: 'move' }}>
                    <h3 className="card-title fw-bold fs-5">Attendance Over Time</h3>
                  </div>
                  <div className="card-body">
                    <Chart options={attendanceChartOptions} series={attendanceChartSeries} type="area" height={350} />
                    <div className="d-flex flex-row justify-content-end mt-2">
                      <span className="me-2"><i className="bi bi-square-fill text-primary"></i> ADULTS</span>
                      <span className="me-2"><i className="bi bi-square-fill text-success"></i> YOUTHS</span>
                      <span className="me-2"><i className="bi bi-square-fill text-warning"></i> CHILDREN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial/Bar Chart */}
              <div className="card col-lg-7 mb-4">
                <div className="card-header" style={{ cursor: 'move' }}>
                  <div className="d-flex justify-content-between">
                    <h3 className="card-title fw-bold fs-5">Financial Overview</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="position-relative mb-4">
                    <Chart options={financialChartOptions} series={financialChartSeries} type="bar" height={200} />
                  </div>
                  <div className="d-flex flex-row justify-content-end">
                    <span className="me-2"><i className="bi bi-square-fill text-primary"></i> Net Profit</span>
                    <span className="me-2"><i className="bi bi-square-fill text-success"></i> Revenue</span>
                    <span><i className="bi bi-square-fill text-warning"></i> Cash Flow</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="col-lg-5">
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="card-title fw-bold fs-5">Church Population Distribution</h3>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12">
                        <Chart options={pieChartOptions} series={pieChartSeries} type="donut" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offering Chart */}
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-header" style={{ cursor: 'move' }}>
                    <h3 className="card-title fw-bold fs-5">Offering Over Time</h3>
                  </div>
                  <div className="card-body">
                    <Chart options={offeringChartOptions} series={offeringChartSeries} type="area" height={500} />
                    <div className="d-flex flex-row justify-content-end mt-2">
                      <span className="me-2"><i className="bi bi-square-fill text-primary"></i> First Offering</span>
                      <span className="me-2"><i className="bi bi-square-fill text-success"></i> Second Offering</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;






























// import React, { useState } from 'react';
// import Chart from 'react-apexcharts';
// import '../assets/styles/Home.css';

// const Home = () => {
//   const [timeFilter, setTimeFilter] = useState('month');

//   // Sample Data
//   const stats = {
//     members: { value: 450, change: 12.5, label: 'Total Members' },
//     workers: { value: 65, change: 5.2, label: 'Active Workers' },
//     users: { value: 120, change: 8.1, label: 'System Users' },
//     visitors: { value: 65, change: -2.4, label: 'New Visitors' }
//   };

//   const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
//   // Chart Data
//   const attendanceData = {
//     adults: [150, 160, 155, 170, 165, 180, 175, 190, 185, 200, 195, 210],
//     youth: [80, 85, 82, 90, 88, 95, 92, 100, 98, 105, 102, 110],
//     children: [40, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70]
//   };

//   const financialData = {
//     profit: [44, 55, 57, 56, 61, 58, 63, 60, 66, 68, 70, 75],
//     revenue: [76, 85, 101, 98, 87, 105, 91, 114, 94, 100, 110, 120],
//     cashflow: [35, 41, 36, 26, 45, 48, 52, 53, 41, 50, 55, 60]
//   };

//   const demographics = [120, 140, 85, 95, 60, 50];

//   const offerings = {
//     first: [1200, 1350, 1250, 1400, 1500, 1600, 1550, 1700, 1650, 1800, 1900, 2000],
//     second: [800, 900, 850, 950, 1000, 1100, 1050, 1150, 1100, 1200, 1250, 1300]
//   };

//   // Chart Configurations
//   const attendanceOptions = {
//     chart: {
//       type: 'area',
//       height: 350,
//       toolbar: { show: false },
//       zoom: { enabled: false },
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     },
//     colors: ['#6366f1', '#ec4899', '#f59e0b'],
//     dataLabels: { enabled: false },
//     stroke: { curve: 'smooth', width: 3 },
//     fill: {
//       type: 'gradient',
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.45,
//         opacityTo: 0.05,
//         stops: [0, 100]
//       }
//     },
//     xaxis: {
//       categories: monthLabels,
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 }
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false }
//     },
//     yaxis: {
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 }
//       }
//     },
//     grid: {
//       borderColor: '#e2e8f0',
//       strokeDashArray: 4,
//       xaxis: { lines: { show: false } }
//     },
//     legend: { show: false },
//     tooltip: {
//       theme: 'light',
//       x: { show: true },
//       y: { formatter: (val) => val + ' people' }
//     }
//   };

//   const attendanceSeries = [
//     { name: 'Adults', data: attendanceData.adults },
//     { name: 'Youth', data: attendanceData.youth },
//     { name: 'Children', data: attendanceData.children }
//   ];

//   const financialOptions = {
//     chart: {
//       type: 'bar',
//       height: 300,
//       toolbar: { show: false },
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 8,
//         columnWidth: '60%',
//         borderRadiusApplication: 'end'
//       }
//     },
//     colors: ['#6366f1', '#10b981', '#f59e0b'],
//     dataLabels: { enabled: false },
//     stroke: { show: false },
//     xaxis: {
//       categories: monthLabels,
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 }
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false }
//     },
//     yaxis: {
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 },
//         formatter: (val) => '$' + val + 'k'
//       }
//     },
//     grid: {
//       borderColor: '#e2e8f0',
//       strokeDashArray: 4,
//       xaxis: { lines: { show: false } }
//     },
//     legend: { show: false },
//     tooltip: {
//       theme: 'light',
//       y: { formatter: (val) => '$' + val + 'k' }
//     }
//   };

//   const financialSeries = [
//     { name: 'Net Profit', data: financialData.profit },
//     { name: 'Revenue', data: financialData.revenue },
//     { name: 'Cash Flow', data: financialData.cashflow }
//   ];

//   const pieOptions = {
//     chart: {
//       type: 'donut',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     },
//     labels: ['Adult M', 'Adult F', 'Youth M', 'Youth F', 'Child M', 'Child F'],
//     colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'],
//     plotOptions: {
//       pie: {
//         donut: {
//           size: '70%',
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: 'Total',
//               fontSize: '14px',
//               fontWeight: 600,
//               color: '#1e293b',
//               formatter: () => demographics.reduce((a, b) => a + b, 0)
//             }
//           }
//         }
//       }
//     },
//     dataLabels: { enabled: false },
//     legend: {
//       position: 'bottom',
//       fontSize: '12px',
//       fontWeight: 500,
//       labels: { colors: '#64748b' },
//       markers: { width: 10, height: 10, radius: 10 }
//     },
//     stroke: { width: 0 },
//     tooltip: {
//       theme: 'light',
//       y: { formatter: (val) => val }
//     }
//   };

//   const offeringOptions = {
//     chart: {
//       type: 'area',
//       height: 320,
//       toolbar: { show: false },
//       zoom: { enabled: false },
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     },
//     colors: ['#6366f1', '#10b981'],
//     dataLabels: { enabled: false },
//     stroke: { curve: 'smooth', width: 3 },
//     fill: {
//       type: 'gradient',
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.45,
//         opacityTo: 0.05,
//         stops: [0, 100]
//       }
//     },
//     xaxis: {
//       categories: monthLabels,
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 }
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false }
//     },
//     yaxis: {
//       labels: {
//         style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 },
//         formatter: (val) => 'GHS ' + val
//       }
//     },
//     grid: {
//       borderColor: '#e2e8f0',
//       strokeDashArray: 4,
//       xaxis: { lines: { show: false } }
//     },
//     legend: { show: false },
//     tooltip: {
//       theme: 'light',
//       y: { formatter: (val) => 'GHS ' + val.toLocaleString() }
//     }
//   };

//   const offeringSeries = [
//     { name: '1st Offering', data: offerings.first },
//     { name: '2nd Offering', data: offerings.second }
//   ];

//   return (
//     <div className="ultra-dashboard">
      
//       {/* Header Section */}
//       <div className="dash-header">
//         <div className="header-content">
//           <div className="header-left">
//             <h1 className="dash-title">Church Dashboard</h1>
//             <p className="dash-subtitle">Track and analyze your church metrics in real-time</p>
//           </div>
//           <div className="header-right">
//             <div className="time-filter">
//               <button 
//                 className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
//                 onClick={() => setTimeFilter('week')}
//               >
//                 Week
//               </button>
//               <button 
//                 className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
//                 onClick={() => setTimeFilter('month')}
//               >
//                 Month
//               </button>
//               <button 
//                 className={`filter-btn ${timeFilter === 'year' ? 'active' : ''}`}
//                 onClick={() => setTimeFilter('year')}
//               >
//                 Year
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="stats-row">
//         <div className="stat-box gradient-purple">
//           <div className="stat-icon">
//             <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
//             </svg>
//           </div>
//           <div className="stat-info">
//             <h3>{stats.members.value}</h3>
//             <p>{stats.members.label}</p>
//             <span className="stat-change positive">
//               <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                 <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
//               </svg>
//               +{stats.members.change}%
//             </span>
//           </div>
//         </div>

//         <div className="stat-box gradient-pink">
//           <div className="stat-icon">
//             <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
//             </svg>
//           </div>
//           <div className="stat-info">
//             <h3>{stats.workers.value}</h3>
//             <p>{stats.workers.label}</p>
//             <span className="stat-change positive">
//               <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                 <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
//               </svg>
//               +{stats.workers.change}%
//             </span>
//           </div>
//         </div>

//         <div className="stat-box gradient-blue">
//           <div className="stat-icon">
//             <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
//               <polyline points="17 11 19 13 23 9"/>
//             </svg>
//           </div>
//           <div className="stat-info">
//             <h3>{stats.users.value}</h3>
//             <p>{stats.users.label}</p>
//             <span className="stat-change positive">
//               <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                 <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
//               </svg>
//               +{stats.users.change}%
//             </span>
//           </div>
//         </div>

//         <div className="stat-box gradient-green">
//           <div className="stat-icon">
//             <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
//             </svg>
//           </div>
//           <div className="stat-info">
//             <h3>{stats.visitors.value}</h3>
//             <p>{stats.visitors.label}</p>
//             <span className="stat-change negative">
//               <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                 <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
//               </svg>
//               {stats.visitors.change}%
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Charts Grid */}
//       <div className="charts-layout">
        
//         {/* Attendance Chart */}
//         <div className="chart-box wide">
//           <div className="chart-head">
//             <div className="chart-title-group">
//               <h3>Attendance Trends</h3>
//               <p>Monthly breakdown by demographics</p>
//             </div>
//             <div className="chart-badges">
//               <span className="badge badge-purple">Adults</span>
//               <span className="badge badge-pink">Youth</span>
//               <span className="badge badge-orange">Children</span>
//             </div>
//           </div>
//           <div className="chart-content">
//             <Chart options={attendanceOptions} series={attendanceSeries} type="area" height={350} />
//           </div>
//         </div>

//         {/* Financial Chart */}
//         <div className="chart-box">
//           <div className="chart-head">
//             <div className="chart-title-group">
//               <h3>Financial Overview</h3>
//               <p>Monthly financial metrics</p>
//             </div>
//           </div>
//           <div className="chart-content">
//             <Chart options={financialOptions} series={financialSeries} type="bar" height={300} />
//             <div className="chart-footer">
//               <div className="footer-legend">
//                 <span className="dot dot-purple"></span>Net Profit
//               </div>
//               <div className="footer-legend">
//                 <span className="dot dot-green"></span>Revenue
//               </div>
//               <div className="footer-legend">
//                 <span className="dot dot-orange"></span>Cash Flow
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Demographics Chart */}
//         <div className="chart-box">
//           <div className="chart-head">
//             <div className="chart-title-group">
//               <h3>Demographics</h3>
//               <p>Member distribution</p>
//             </div>
//           </div>
//           <div className="chart-content">
//             <Chart options={pieOptions} series={demographics} type="donut" height={300} />
//           </div>
//         </div>

//         {/* Offering Chart */}
//         <div className="chart-box wide">
//           <div className="chart-head">
//             <div className="chart-title-group">
//               <h3>Offering Collections</h3>
//               <p>Monthly offering analysis</p>
//             </div>
//             <div className="chart-badges">
//               <span className="badge badge-purple">1st Offering</span>
//               <span className="badge badge-green">2nd Offering</span>
//             </div>
//           </div>
//           <div className="chart-content">
//             <Chart options={offeringOptions} series={offeringSeries} type="area" height={320} />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Home;
