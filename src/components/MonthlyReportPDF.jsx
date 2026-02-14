import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { paddingVertical: 40, paddingHorizontal: 15, backgroundColor: '#ffffff', position: 'relative' },
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
        marginHorizontal: 10
    },
    title: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase' },
    subTitle: { fontSize: 18, marginVertical: 2 },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: 5, fontSize: 12, fontWeight: 'bold'
    },
    serviceTitle: {
        fontSize: 14, 
        fontWeight: 'bold', 
        marginTop: 20, 
        marginBottom: 8, 
        textAlign: 'center', 
        textTransform: 'uppercase'
    },
    table: { 
        display: 'table', 
        width: '100%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderBottomWidth: 0, 
        borderRightWidth: 0   
    },
    row: { flexDirection: 'row', minHeight: 22 },
    headerCell: {
        backgroundColor: '#f0f0f0',
        borderStyle: 'solid',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerText: { fontSize: 7, fontWeight: 'bold', textAlign: 'center' },
    cell: {
        borderStyle: 'solid',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3 
    },
    cellText: { fontSize: 9, textAlign: 'center' },
    reasonText: { fontSize: 9, fontStyle: 'italic', color: '#444' },
    footer: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#666' }
});

const RegularTable = ({ title, rows }) => {
    const tableTotals = rows.reduce((acc, r) => {
        if (r.reason || !r.adults) return acc;
        return {
            am: acc.am + (r.adults?.m || 0), af: acc.af + (r.adults?.f || 0), at: acc.at + (r.adults?.t || 0),
            ym: acc.ym + (r.youth?.m || 0), yf: acc.yf + (r.youth?.f || 0), yt: acc.yt + (r.youth?.t || 0),
            cm: acc.cm + (r.children?.m || 0), cf: acc.cf + (r.children?.f || 0), ct: acc.ct + (r.children?.t || 0),
            nm: acc.nm + (r.newcomers?.m || 0), nf: acc.nf + (r.newcomers?.f || 0), nt: acc.nt + (r.newcomers?.t || 0),
            ta: acc.ta + (r.totalAttendance || 0),
            o1: acc.o1 + (r.offering?.first || 0), o2: acc.o2 + (r.offering?.second || 0), ot: acc.ot + (r.offering?.total || 0),
        };
    }, { am: 0, af: 0, at: 0, ym: 0, yf: 0, yt: 0, cm: 0, cf: 0, ct: 0, nm: 0, nf: 0, nt: 0, ta: 0, o1: 0, o2: 0, ot: 0 });

    return (
        <View wrap={false}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '7%', minHeight: 44 }]}><Text style={styles.headerText}>Week</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.headerText}>ADULTS</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.headerText}>YOUTHS</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.headerText}>CHILDREN</Text></View>
                    <View style={[styles.headerCell, { width: '15%' }]}><Text style={styles.headerText}>NEWCOMERS</Text></View>
                    <View style={[styles.headerCell, { width: '8%', minHeight: 44 }]}><Text style={styles.headerText}>TOTAL</Text></View>
                    <View style={[styles.headerCell, { width: '25%' }]}><Text style={styles.headerText}>OFFERING</Text></View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '7%', borderBottomWidth: 1 }]} /> 
                    {['ADULTS', 'YOUTHS', 'CHILDREN', 'NEWCOMERS'].map((label) => (
                        <React.Fragment key={label}>
                            <View style={[styles.headerCell, { width: '5%' }]}><Text style={styles.headerText}>M</Text></View>
                            <View style={[styles.headerCell, { width: '5%' }]}><Text style={styles.headerText}>F</Text></View>
                            <View style={[styles.headerCell, { width: '5%' }]}><Text style={styles.headerText}>T</Text></View>
                        </React.Fragment>
                    ))}
                    <View style={[styles.headerCell, { width: '8%' }]} /> 
                    <View style={[styles.headerCell, { width: '8%' }]}><Text style={styles.headerText}>1st</Text></View>
                    <View style={[styles.headerCell, { width: '8%' }]}><Text style={styles.headerText}>2nd</Text></View>
                    <View style={[styles.headerCell, { width: '9%' }]}><Text style={styles.headerText}>Total</Text></View>
                </View>

                {rows.map((r, i) => (
                    <View style={styles.row} key={i}>
                        <View style={[styles.cell, { width: '7%' }]}><Text style={styles.cellText}>{i + 1}</Text></View>
                        {r.reason ? (
                            <View style={[styles.cell, { width: '93%' }]}><Text style={styles.reasonText}>{r.reason}</Text></View>
                        ) : !r.adults ? (
                            <View style={[styles.cell, { width: '93%' }]}><Text style={[styles.reasonText, { color: '#999' }]}>No attendance entered</Text></View>
                        ) : (
                            <>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.adults?.m}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.adults?.f}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.adults?.t}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.youth?.m}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.youth?.f}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.youth?.t}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.children?.m}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.children?.f}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.children?.t}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.newcomers?.m}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.newcomers?.f}</Text></View>
                                <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{r.newcomers?.t}</Text></View>
                                <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{r.totalAttendance}</Text></View>
                                <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{r.offering?.first?.toFixed(2)}</Text></View>
                                <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{r.offering?.second?.toFixed(2)}</Text></View>
                                <View style={[styles.cell, { width: '9%' }]}><Text style={styles.cellText}>{r.offering?.total?.toFixed(2)}</Text></View>
                            </>
                        )}
                    </View>
                ))}

                <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
                    <View style={[styles.cell, { width: '7%' }]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>Total</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.am}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.af}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.at}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.ym}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.yf}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.yt}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.cm}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.cf}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.ct}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.nm}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.nf}</Text></View>
                    <View style={[styles.cell, { width: '5%' }]}><Text style={styles.cellText}>{tableTotals.nt}</Text></View>
                    <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{tableTotals.ta}</Text></View>
                    <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{tableTotals.o1.toFixed(2)}</Text></View>
                    <View style={[styles.cell, { width: '8%' }]}><Text style={styles.cellText}>{tableTotals.o2.toFixed(2)}</Text></View>
                    <View style={[styles.cell, { width: '9%' }]}><Text style={styles.cellText}>{tableTotals.ot.toFixed(2)}</Text></View>
                </View>
            </View>
        </View>
    );
};

const SpecialTable = ({ title, rows }) => {
    const tableTotals = rows.reduce((acc, curr) => ({
        a: acc.a + (curr.adults || 0), 
        y: acc.y + (curr.youths || 0), 
        c: acc.c + (curr.children || 0), 
        t: acc.t + ((curr.adults || 0) + (curr.youths || 0) + (curr.children || 0))
    }), { a: 0, y: 0, c: 0, t: 0 });

    return (
        <View wrap={false}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <View style={[styles.headerCell, { width: '30%' }]}><Text style={styles.headerText}>Date</Text></View>
                    <View style={[styles.headerCell, { width: '17.5%' }]}><Text style={styles.headerText}>Adults</Text></View>
                    <View style={[styles.headerCell, { width: '17.5%' }]}><Text style={styles.headerText}>Youths</Text></View>
                    <View style={[styles.headerCell, { width: '17.5%' }]}><Text style={styles.headerText}>Children</Text></View>
                    <View style={[styles.headerCell, { width: '17.5%' }]}><Text style={styles.headerText}>Total</Text></View>
                </View>
                {rows.map((r, i) => (
                    <View style={styles.row} key={i}>
                        <View style={[styles.cell, { width: '30%' }]}><Text style={styles.cellText}>{new Date(r.date).toISOString().split('T')[0]}</Text></View>
                        <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{r.adults || 0}</Text></View>
                        <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{r.youths || 0}</Text></View>
                        <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{r.children || 0}</Text></View>
                        <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{(r.adults || 0) + (r.youths || 0) + (r.children || 0)}</Text></View>
                    </View>
                ))}
                <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
                    <View style={[styles.cell, { width: '30%' }]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>Total</Text></View>
                    <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{tableTotals.a}</Text></View>
                    <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{tableTotals.y}</Text></View>
                    <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{tableTotals.c}</Text></View>
                    <View style={[styles.cell, { width: '17.5%' }]}><Text style={styles.cellText}>{tableTotals.t}</Text></View>
                </View>
            </View>
        </View>
    );
};

const MonthlyReportPDF = ({ data, month, logo }) => {
    // Access names directly from the data.meta returned by backend
    const { groupName, churchName } = data.meta || {};
    
    // Determine if it is a group report to hide Church details
    const isGroupReport = !churchName || churchName === 'Entire Group';

    return (
        <Document title={`Report_${churchName || groupName}_${month}`}>
            <Page size="A4" style={styles.page}>
                <Image src={logo} style={styles.watermark} fixed />
                <View style={styles.header}>
                    <Text style={styles.title}>Monthly Attendance Report</Text>

                    <View style={styles.infoRow}>
                        <Text>MONTH: {month.toUpperCase()}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {!isGroupReport && (
                                <>
                                    <Text>Church: {churchName}</Text>
                                    <Text style={{ color: '#999', marginHorizontal: 8 }}>|</Text>
                                </>
                            )}
                            <Text>Group: {groupName}</Text>
                        </View>
                    </View>
                </View>

                <RegularTable title="Sunday Worship Service" rows={data.sunday} />
                <RegularTable title="Monday Bible Studies" rows={data.monday} />
                <RegularTable title="Thursday Revival & Training" rows={data.thursday} />

                <View break />
                <View style={{ textAlign: 'center', marginBottom: 10, marginTop: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SPECIAL SERVICES</Text>
                </View>

                <SpecialTable title="GCK" rows={data.gck} />
                <SpecialTable title="Home Caring Fellowship" rows={data.homeCaringFellowship} />
                <SpecialTable title="Seminars" rows={data.seminar} />

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

export default MonthlyReportPDF;