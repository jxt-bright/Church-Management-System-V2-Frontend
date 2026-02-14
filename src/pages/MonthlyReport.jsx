
import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/MonthlyAttendanceReport.module.css';
import { useAuth } from '../context/AuthContext';
import { RequireAccess } from '../components/RequireAccess.jsx';
import FlashMessage from '../components/FlashMessage'; 
import groupService from '../services/groupService';
import churchService from '../services/churchService';
import reportService from '../services/reportService';

// PDF Imports
import { pdf } from '@react-pdf/renderer';
import MonthlyReportPDF from '../components/MonthlyReportPDF.jsx';
import logo from '../assets/images/church_logo.png';

// Icons
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>;
const ChevronDown = ({ className }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SearchSelect = ({ label, options, value, onChange, placeholder, disabled, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option.value === 'group' || option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`${styles['search-select-container']} ${disabled ? styles.disabled : ''}`} ref={dropdownRef}>
            <div className={styles['trigger-header-content']}>
                <label className={styles['form-label']}>{label}</label>
                {disabled && <span className={styles['disabled-badge']}>Locked</span>}
            </div>
            <div style={{ position: 'relative' }}>
                <div className={styles['select-trigger']} onClick={() => !disabled && setIsOpen(!isOpen)}>
                    <span className={selectedOption ? '' : styles.placeholder}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedOption && !disabled && (
                            <button type="button" className={styles['clear-button']} onClick={(e) => { e.stopPropagation(); onChange(null); }}>
                                <XIcon />
                            </button>
                        )}
                        <ChevronDown className={isOpen ? styles.open : ''} />
                    </div>
                </div>
                {isOpen && (
                    <div className={styles['dropdown-menu']}>
                        <div className={styles['search-box']}>
                            <SearchIcon />
                            <input type="text" placeholder="Search..." autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className={styles['options-list']}>
                            {isLoading ? <div className={styles.option}>Loading...</div> :
                             filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => (
                                    <div key={opt.value} className={`${styles.option} ${value === opt.value ? styles.selected : ''}`} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}>
                                        {opt.label}
                                    </div>
                                ))
                             ) : (
                                <div className={styles.option} style={{ color: '#94a3b8' }}>No results found</div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MonthlyAttendanceReport = () => {
    const { user } = useAuth();
    const userStatus = user?.status?.toLowerCase();
    
    const [showModal, setShowModal] = useState(true);
    const [isFetchingReport, setIsFetchingReport] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });
    
    const [groups, setGroups] = useState([]);
    const [churches, setChurches] = useState([]);
    const [reportData, setReportData] = useState({ 
        monday: [], thursday: [], sunday: [],
        gck: [], homeCaringFellowship: [], seminar: [] 
    });

    const [formData, setFormData] = useState({
        groupId: null,
        churchId: null,
        month: new Date().toISOString().slice(0, 7)
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                if (userStatus === 'manager') {
                    const groupRes = await groupService.getGroups();
                    setGroups(groupRes.groups || groupRes.data || groupRes || []);
                }
                const churchParams = userStatus !== 'manager' ? { groupId: user?.groupId } : {};
                const churchRes = await churchService.getChurches(churchParams);
                setChurches(churchRes.churches || churchRes.data || churchRes || []);
            } catch (err) { console.error("Report Initial Load Error:", err); } 
            finally { setIsLoadingInitial(false); }
        };
        if (user) loadInitialData();
    }, [user, userStatus]);

    const groupOptions = groups.map(g => ({ value: g._id, label: g.name }));
    const churchOptions = [
        ...(userStatus === 'grouppastor' || userStatus === 'groupadmin' ? [{ value: 'group', label: 'Whole Group' }] : []),
        ...churches.map(c => ({ value: c._id, label: c.name || c.churchname }))
    ];

    const formatMonthDisplay = (val) => new Date(val + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    const getSelectedGroupName = () => {
        if (formData.groupId) {
            return groups.find(g => g._id === formData.groupId)?.name || "N/A";
        }
        if (formData.churchId && formData.churchId !== 'group') {
            const selectedChurch = churches.find(c => c._id === formData.churchId);
            if (selectedChurch?.groupName) return selectedChurch.groupName;
        }
        return user?.groupName || "";
    };
    
    const getSelectedChurchName = () => {
        if (formData.churchId === 'group') return 'Entire Group';
        const activeId = (userStatus === 'churchpastor' || userStatus === 'churchadmin') ? user?.churchId : formData.churchId;
        const found = churches.find(c => c._id === activeId);
        return found?.churchname || found?.name || user?.churchName || "";
    };

    const handleParamChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleLoadReport = async (e) => {
        e.preventDefault();
        const isLocalUser = userStatus === 'churchpastor' || userStatus === 'churchadmin';

        if (!isLocalUser && !formData.groupId && !formData.churchId) {
            setFlash({ message: 'Please select either a Group or a Church.', type: 'danger' });
            return;
        }

        setIsFetchingReport(true);
        const isWholeGroup = formData.churchId === 'group';

        const rawPayload = {
            ...formData,
            groupId: isWholeGroup ? (userStatus.includes('group') ? user?.groupId : formData.groupId) : formData.groupId,
            churchId: isLocalUser ? user?.churchId : (isWholeGroup ? null : formData.churchId),
        };

        const cleanPayload = Object.fromEntries(
            Object.entries(rawPayload).filter(([_, value]) => value !== null && value !== undefined && value !== '')
        );

        try {
            const data = await reportService.monthlyReport(cleanPayload);
            setReportData({
                monday: data?.monday || [],
                thursday: data?.thursday || [],
                sunday: data?.sunday || [],
                gck: data?.gck || [],
                homeCaringFellowship: data?.homeCaringFellowship || [],
                seminar: data?.seminar || []
            });
            setShowModal(false);
            setFlash({ message: 'Report generated successfully!', type: 'success' });
        } catch (err) {
            setFlash({ message: err.response?.data?.message || "Failed to load report.", type: 'danger' });
        } finally {
            setIsFetchingReport(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsFetchingReport(true);
        try {
            const doc = (
                <MonthlyReportPDF
                    data={reportData}
                    month={formatMonthDisplay(formData.month)}
                    churchName={getSelectedChurchName()}
                    groupName={getSelectedGroupName()}
                    logo={logo}
                />
            );
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Report_${getSelectedChurchName()}_${formData.month}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setFlash({ message: 'Error generating PDF.', type: 'danger' });
        } finally {
            setIsFetchingReport(false);
        }
    };

    const isGroupDisabled = formData.churchId !== null && formData.churchId !== 'group';
    const isChurchDisabled = formData.groupId !== null;

    // Changes: Calculated ONLY using Monday, Thursday, and Sunday (Excluding special services)
    const totalWeeklyAttendance =
        [...reportData.monday, ...reportData.thursday, ...reportData.sunday]
        .reduce((s, r) => s + (r?.reason || !r?.totalAttendance ? 0 : r.totalAttendance), 0);

    const totalAllOffering =
        [...reportData.monday, ...reportData.thursday, ...reportData.sunday]
        .reduce((s, r) => s + (r?.reason || !r?.offering?.total ? 0 : r.offering.total), 0);

    const ServiceTable = ({ title, data = [], colorClass }) => {
        const safeData = data || [];
        const tableTotals = safeData.reduce(
            (acc, r) => {
                if (r.reason || !r.adults) return acc;
                return {
                    am: acc.am + (r.adults?.m || 0), af: acc.af + (r.adults?.f || 0), at: acc.at + (r.adults?.t || 0),
                    ym: acc.ym + (r.youth?.m || 0), yf: acc.yf + (r.youth?.f || 0), yt: acc.yt + (r.youth?.t || 0),
                    cm: acc.cm + (r.children?.m || 0), cf: acc.cf + (r.children?.f || 0), ct: acc.ct + (r.children?.t || 0),
                    nm: acc.nm + (r.newcomers?.m || 0), nf: acc.nf + (r.newcomers?.f || 0), nt: acc.nt + (r.newcomers?.t || 0),
                    ta: acc.ta + (r.totalAttendance || 0), o1: acc.o1 + (r.offering?.first || 0), o2: acc.o2 + (r.offering?.second || 0), ot: acc.ot + (r.offering?.total || 0),
                };
            },
            { am: 0, af: 0, at: 0, ym: 0, yf: 0, yt: 0, cm: 0, cf: 0, ct: 0, nm: 0, nf: 0, nt: 0, ta: 0, o1: 0, o2: 0, ot: 0 }
        );

        return (
            <div className={styles['service-card']}>
                <div className={`${styles['service-title']} ${colorClass}`}>{title}</div>
                <div className={styles['table-wrapper']}>
                    <table className={styles['report-table']}>
                        <thead>
                            <tr>
                                <th className={styles['main-header']} rowSpan={2}>Week</th>
                                <th className={styles['main-header']} colSpan={3}>Adults</th>
                                <th className={styles['main-header']} colSpan={3}>Youth</th>
                                <th className={styles['main-header']} colSpan={3}>Children</th>
                                <th className={styles['main-header']} colSpan={3}>Newcomers</th>
                                <th className={styles['main-header']} rowSpan={2}>Total Attendance</th>
                                <th className={styles['main-header']} colSpan={3}>Offering</th>
                            </tr>
                            <tr className={styles['sub-header-row']}>
                                <th className={styles['sub-header']}>M</th><th className={styles['sub-header']}>F</th><th className={styles['sub-header']}>T</th>
                                <th className={styles['sub-header']}>M</th><th className={styles['sub-header']}>F</th><th className={styles['sub-header']}>T</th>
                                <th className={styles['sub-header']}>M</th><th className={styles['sub-header']}>F</th><th className={styles['sub-header']}>T</th>
                                <th className={styles['sub-header']}>M</th><th className={styles['sub-header']}>F</th><th className={styles['sub-header']}>T</th>
                                <th className={styles['sub-header']}>1st</th><th className={styles['sub-header']}>2nd</th><th className={styles['sub-header']}>T</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeData.length > 0 ? (
                                <>
                                    {safeData.map((week, idx) => (
                                        <tr key={idx}>
                                            <td className={styles['week-label']}>Week {idx + 1}</td>
                                            {week.reason ? (
                                                <td colSpan="16" className={styles['reason-row-cell']}>{week.reason}</td>
                                            ) : !week.adults ? (
                                                <td colSpan="16" style={{ background: '#f8fafc', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No attendance entered</td>
                                            ) : (
                                                <>
                                                    <td>{week.adults?.m || 0}</td><td>{week.adults?.f || 0}</td><td className={styles['total-cell']}>{week.adults?.t || 0}</td>
                                                    <td>{week.youth?.m || 0}</td><td>{week.youth?.f || 0}</td><td className={styles['total-cell']}>{week.youth?.t || 0}</td>
                                                    <td>{week.children?.m || 0}</td><td>{week.children?.f || 0}</td><td className={styles['total-cell']}>{week.children?.t || 0}</td>
                                                    <td>{week.newcomers?.m || 0}</td><td>{week.newcomers?.f || 0}</td><td className={styles['total-cell']}>{week.newcomers?.t || 0}</td>
                                                    <td className={styles['attendance-total-cell']}>{week.totalAttendance || 0}</td>
                                                    <td>{week.offering?.first?.toFixed(2) || '0.00'}</td><td>{week.offering?.second?.toFixed(2) || '0.00'}</td><td className={styles['offering-total-cell']}>{week.offering?.total?.toFixed(2) || '0.00'}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    <tr className={styles['final-totals-row']}>
                                        <td className={styles['week-label']}>Total</td>
                                        <td>{tableTotals.am}</td><td>{tableTotals.af}</td><td className={styles['total-cell']}>{tableTotals.at}</td>
                                        <td>{tableTotals.ym}</td><td>{tableTotals.yf}</td><td className={styles['total-cell']}>{tableTotals.yt}</td>
                                        <td>{tableTotals.cm}</td><td>{tableTotals.cf}</td><td className={styles['total-cell']}>{tableTotals.ct}</td>
                                        <td>{tableTotals.nm}</td><td>{tableTotals.nf}</td><td className={styles['total-cell']}>{tableTotals.nt}</td>
                                        <td className={styles['attendance-total-cell']}>{tableTotals.ta}</td>
                                        <td>{tableTotals.o1.toFixed(2)}</td><td>{tableTotals.o2.toFixed(2)}</td><td className={styles['offering-total-cell']}>{tableTotals.ot.toFixed(2)}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr><td colSpan="17" className={styles['empty-table-cell']}>No service days found in this month.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const SpecialServiceTable = ({ title, data = [], colorClass }) => {
        const tableTotals = data.reduce((acc, curr) => ({
            a: acc.a + (curr.adults || 0),
            y: acc.y + (curr.youths || 0),
            c: acc.c + (curr.children || 0),
            t: acc.t + (curr.adults + curr.youths + curr.children)
        }), { a: 0, y: 0, c: 0, t: 0 });

        return (
            <div className={styles['service-card']}>
                <div className={`${styles['service-title']} ${colorClass}`}>{title}</div>
                <div className={styles['table-wrapper']}>
                    <table className={styles['report-table']}>
                        <thead>
                            <tr>
                                <th className={styles['main-header']}>Date</th>
                                <th className={styles['main-header']}>Adults</th>
                                <th className={styles['main-header']}>Youths</th>
                                <th className={styles['main-header']}>Children</th>
                                <th className={styles['main-header']}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                <>
                                    {data.map((service, idx) => (
                                        <tr key={idx}>
                                            <td className={styles['week-label']}>{new Date(service.date).toISOString().split('T')[0]}</td>
                                            <td>{service.adults}</td>
                                            <td>{service.youths}</td>
                                            <td>{service.children}</td>
                                            <td className={styles['attendance-total-cell']}>{service.adults + service.youths + service.children}</td>
                                        </tr>
                                    ))}
                                    <tr className={styles['final-totals-row']}>
                                        <td className={styles['week-label']}>Total</td>
                                        <td>{tableTotals.a}</td>
                                        <td>{tableTotals.y}</td>
                                        <td>{tableTotals.c}</td>
                                        <td className={styles['attendance-total-cell']}>{tableTotals.t}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr><td colSpan="5" className={styles['empty-table-cell']}>No records found for this category.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.reportPageWrapper}>
            <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />
            <div className={styles['app-container']}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>📊 Monthly Attendance Report</h1>
                        <p>{isFetchingReport ? 'Processing...' : 'Service Tracking And Analysis'}</p>
                    </div>

                    <div className={styles['report-info']}>
                        <div className={styles['report-info-group']}>
                            {/* Always show Group */}
                            <div className={styles['report-info-item']}>
                                <span className={styles['report-info-label']}>Group:</span>
                                <span className={styles['report-info-value']}>{getSelectedGroupName()}</span>
                            </div>
                            
                            {/* ONLY show Church if it is NOT a group selection */}
                            {formData.churchId !== 'group' && (
                                <div className={styles['report-info-item']}>
                                    <span className={styles['report-info-label']}>Church:</span>
                                    <span className={styles['report-info-value']}>{getSelectedChurchName()}</span>
                                </div>
                            )}

                            <div className={styles['report-info-item']}>
                                <span className={styles['report-info-label']}>Month:</span>
                                <span className={styles['report-info-value']}>{formData.month ? formatMonthDisplay(formData.month) : '-'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className={styles['report-info-item']}>
                                <span className={styles['report-info-label']}>Total Attendance:</span>
                                <span className={styles['report-info-value']} style={{ fontWeight: 'bold' }}>
                                    {(totalWeeklyAttendance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className={styles['report-info-item']}>
                                <span className={styles['report-info-label']}>Total Offering:</span>
                                <span className={styles['report-info-value']} style={{ fontWeight: 'bold' }}>
                                    {(totalAllOffering || 0).toFixed(2)}
                                </span>
                            </div>
                            <button className={styles['change-btn']} onClick={() => setShowModal(true)}>Change Selection</button>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <ServiceTable title="📖 Monday Bible Studies" colorClass={styles.monday} data={reportData.monday} />
                        <ServiceTable title="🔥 Thursday Revival and Training" colorClass={styles.thursday} data={reportData.thursday} />
                        <ServiceTable title="⛪ Sunday Worship Service" colorClass={styles.sunday} data={reportData.sunday} />
                        
                        <div style={{ margin: '40px 0', borderTop: '2px dashed #cbd5e1' }}></div>
                        <SpecialServiceTable title="⛪ GCK Service" colorClass={styles.sunday} data={reportData.gck} />
                        <SpecialServiceTable title="🏠 Home Caring Fellowship" colorClass={styles.monday} data={reportData.homeCaringFellowship} />
                        <SpecialServiceTable title="🎓 Seminar" colorClass={styles.thursday} data={reportData.seminar} />

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button className={styles['print-button']} onClick={handleDownloadPDF} disabled={isFetchingReport}>
                                {isFetchingReport ? 'Generating PDF...' : 'Generate PDF'}
                            </button>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className={styles['modal-overlay']} onClick={() => setShowModal(false)}>
                        <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                            <button className={styles['modal-close-btn']} onClick={() => setShowModal(false)}><XIcon size={18} /></button>
                            <div className={styles['modal-header']}><h2>📊 Report Parameters</h2></div>
                            <form onSubmit={handleLoadReport} className={styles['modal-form']}>
                                <RequireAccess minStatus="manager">
                                    <SearchSelect label="Select Group" options={groupOptions} value={formData.groupId} onChange={(v) => handleParamChange('groupId', v)} placeholder="Search Group..." isLoading={isLoadingInitial} disabled={isGroupDisabled} />
                                </RequireAccess>
                                <RequireAccess minStatus="groupAdmin">
                                    <SearchSelect label="Select Church" options={churchOptions} value={formData.churchId} onChange={(v) => handleParamChange('churchId', v)} placeholder="Search Church..." isLoading={isLoadingInitial} disabled={isChurchDisabled} />
                                </RequireAccess>
                                <div className={styles['form-group']}>
                                    <label className={styles['form-label']}>Select Month</label>
                                    <input type="month" className={styles['month-input']} value={formData.month} onChange={(e) => handleParamChange('month', e.target.value)} required />
                                </div>
                                <button type="submit" className={styles['submit-button']} disabled={isFetchingReport}>
                                    {isFetchingReport ? 'Loading...' : 'Generate Report'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyAttendanceReport;
