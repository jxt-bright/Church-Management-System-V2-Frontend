import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { paddingVertical: 40, paddingHorizontal: 30, backgroundColor: '#ffffff', position: 'relative' },
    watermark: {
        position: 'absolute', 
        top: '25%', 
        left: '15%', 
        width: '70%', 
        opacity: 0.1, 
        zIndex: -1
    },
    header: {
        textAlign: 'center', marginBottom: 15,
        borderBottom: '2pt solid #000', 
        paddingBottom: 5,
    },
    title: { fontSize: 22, fontWeight: 'bold', textTransform: 'uppercase' },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: 5, fontSize: 10, fontWeight: 'bold'
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 25,
        marginBottom: 10,
        textDecoration: 'underline',
        textTransform: 'uppercase'
    },
    serviceTitle: {
        fontSize: 12, 
        fontWeight: 'bold', 
        marginTop: 15, 
        marginBottom: 5, 
        textAlign: 'center', 
        textTransform: 'uppercase',
        padding: 4
    },
    table: { 
        display: 'table', 
        width: '100%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
    },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 20 },
    noBorderRow: { flexDirection: 'row', minHeight: 20 },
    headerCell: {
        backgroundColor: '#e4e4e4',
        borderRightWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        padding: 4
    },
    cell: {
        borderRightWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        padding: 4
    },
    labelCell: { width: '40%', fontWeight: 'bold' },
    dataCell: { width: '20%', textAlign: 'center' },
    fullWidthCell: { width: '60%', textAlign: 'center' },
    text: { fontSize: 9 },
    boldText: { fontSize: 9, fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#666' }
});

const GeneralTable = ({ title, data }) => {
    if (!data) return null;
    
    return (
        <View wrap={false} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '100%', borderRightWidth: 0, textAlign: 'center' }]}>
                        <Text style={styles.boldText}>Average Attendance</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.headerCell, styles.labelCell]}><Text style={styles.boldText}>Category</Text></View>
                    <View style={[styles.headerCell, styles.dataCell]}><Text style={styles.boldText}>Males</Text></View>
                    <View style={[styles.headerCell, styles.dataCell]}><Text style={styles.boldText}>Females</Text></View>
                    <View style={[styles.headerCell, styles.dataCell, { borderRightWidth: 0 }]}><Text style={styles.boldText}>Total</Text></View>
                </View>
                {[
                    { label: 'Adults', m: data.am, f: data.af, t: data.at },
                    { label: 'Youths', m: data.ym, f: data.yf, t: data.yt },
                    { label: 'Children', m: data.cm, f: data.cf, t: data.ct },
                    { label: 'New Comers', m: data.nm, f: data.nf, t: data.nt }
                ].map((row, i) => (
                    <View style={styles.row} key={i}>
                        <View style={[styles.cell, styles.labelCell]}><Text style={styles.text}>{row.label}</Text></View>
                        <View style={[styles.cell, styles.dataCell]}><Text style={styles.text}>{row.m}</Text></View>
                        <View style={[styles.cell, styles.dataCell]}><Text style={styles.text}>{row.f}</Text></View>
                        <View style={[styles.cell, styles.dataCell, { borderRightWidth: 0 }]}><Text style={styles.text}>{row.t}</Text></View>
                    </View>
                ))}
                <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
                    <View style={[styles.cell, styles.labelCell]}><Text style={styles.boldText}>Total Attendance</Text></View>
                    <View style={[styles.cell, styles.dataCell]}><Text style={styles.boldText}>{data.am + data.ym + data.cm}</Text></View>
                    <View style={[styles.cell, styles.dataCell]}><Text style={styles.boldText}>{data.af + data.yf + data.cf}</Text></View>
                    <View style={[styles.cell, styles.dataCell, { borderRightWidth: 0 }]}><Text style={styles.boldText}>{data.at + data.yt + data.ct}</Text></View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '100%', borderRightWidth: 0, textAlign: 'center' }]}>
                        <Text style={styles.boldText}>Average Offering</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.cell, styles.labelCell]}><Text style={styles.text}>1st Offering</Text></View>
                    <View style={[styles.cell, styles.fullWidthCell, { borderRightWidth: 0 }]}><Text style={styles.text}>GHS {data.o1}</Text></View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.cell, styles.labelCell]}><Text style={styles.text}>2nd Offering</Text></View>
                    <View style={[styles.cell, styles.fullWidthCell, { borderRightWidth: 0 }]}><Text style={styles.text}>GHS {data.o2}</Text></View>
                </View>
                <View style={[styles.noBorderRow, { backgroundColor: '#f0f0f0' }]}>
                    <View style={[styles.cell, styles.labelCell]}><Text style={styles.boldText}>Total Offering</Text></View>
                    <View style={[styles.cell, styles.fullWidthCell, { borderRightWidth: 0 }]}><Text style={styles.boldText}>GHS {data.ot}</Text></View>
                </View>
            </View>
        </View>
    );
};

const SpecialServiceTable = ({ title, data, shouldAverage }) => {
    if (!data) return null;

    return (
        <View wrap={false} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{title} {shouldAverage && "(Average)"}</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '40%' }]}><Text style={styles.boldText}>{shouldAverage ? "Description" : "Date"}</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.boldText}>Adults</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.boldText}>Youths</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.boldText}>Children</Text></View>
                    <View style={[styles.headerCell, { width: '15%', borderRightWidth: 0 }]}><Text style={styles.boldText}>Total</Text></View>
                </View>
                
                {shouldAverage ? (
                    <View style={styles.noBorderRow}>
                        <View style={[styles.cell, { width: '40%' }]}><Text style={styles.text}>Averages for selected period</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{data.a}</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{data.y}</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{data.c}</Text></View>
                        <View style={[styles.cell, { width: '15%', borderRightWidth: 0 }]}><Text style={styles.text}>{data.t}</Text></View>
                    </View>
                ) : (
                    <>
                        {data.map((r, i) => (
                            <View style={styles.row} key={i}>
                                <View style={[styles.cell, { width: '40%' }]}><Text style={styles.text}>{new Date(r.date).toISOString().split('T')[0]}</Text></View>
                                <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{r.adults}</Text></View>
                                <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{r.youths}</Text></View>
                                <View style={[styles.cell, { width: '15%' }]}><Text style={styles.text}>{r.children}</Text></View>
                                <View style={[styles.cell, { width: '15%', borderRightWidth: 0 }]}><Text style={styles.text}>{r.total}</Text></View>
                            </View>
                        ))}
                        <View style={[styles.noBorderRow, { backgroundColor: '#f9f9f9' }]}>
                            <View style={[styles.cell, { width: '40%' }]}><Text style={styles.boldText}>Total</Text></View>
                            <View style={[styles.cell, { width: '60%', borderRightWidth: 0, textAlign: 'center' }]}><Text style={styles.boldText}>{data.reduce((sum, r) => sum + r.total, 0)}</Text></View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const GeneralReportPDF = ({ data, month, churchName, groupName, logo }) => {
    const isGroupReport = churchName === 'Entire Group';

    return (
        <Document title={`General_Report_${churchName}_${month}`}>
            <Page size="A4" style={styles.page}>
                <Image src={logo} style={styles.watermark} fixed />
                <View style={styles.header}>
                    <Text style={styles.title}>General Service Report</Text>
                    <View style={styles.infoRow}>
                        <Text>PERIOD: {month.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {!isGroupReport && (
                                <>
                                    <Text>Church: {churchName}</Text>
                                    <Text style={{ marginHorizontal: 5 }}>|</Text>
                                </>
                            )}
                            <Text>Group: {groupName}</Text>
                        </View>
                    </View>
                </View>

                <GeneralTable title="Sunday Worship Service" data={data?.sunday} />
                <GeneralTable title="Monday Bible Studies" data={data?.monday} />
                <GeneralTable title="Thursday Revival & Evangelism" data={data?.thursday} />
                
                <Text style={styles.sectionHeader}>SPECIAL SERVICES</Text>
                
                <SpecialServiceTable title="GCK" data={data?.gck} shouldAverage={true} />
                <SpecialServiceTable title="Home Caring Fellowship" data={data?.homeCaringFellowship} shouldAverage={true} />
                <SpecialServiceTable title="Seminars" data={data?.seminar} shouldAverage={false} />

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

export default GeneralReportPDF;