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
import GeneralReportPDF from '../components/GeneralReportPDF.jsx';
import logo from '../assets/images/church_logo.png';

const XIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ChevronDown = ({ className }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>;

const SearchSelect = ({ label, options, value, onChange, placeholder, disabled, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const filteredOptions = options.filter(option => option.value === 'group' || option.label.toLowerCase().includes(searchTerm.toLowerCase()));
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
                    <span className={selectedOption ? '' : styles.placeholder}>{selectedOption ? selectedOption.label : placeholder}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedOption && !disabled && (
                            <button type="button" className={styles['clear-button']} onClick={(e) => { e.stopPropagation(); onChange(null); }}><XIcon /></button>
                        )}
                        <ChevronDown className={isOpen ? styles.open : ''} />
                    </div>
                </div>
                {isOpen && (
                    <div className={styles['dropdown-menu']}>
                        <div className={styles['search-box']}><SearchIcon /><input type="text" placeholder="Search..." autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <div className={styles['options-list']}>
                            {isLoading ? <div className={styles.option}>Loading...</div> :
                                filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => (
                                        <div key={opt.value} className={`${styles.option} ${value === opt.value ? styles.selected : ''}`} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}>{opt.label}</div>
                                    ))
                                ) : (<div className={styles.option} style={{ color: '#94a3b8' }}>No results found</div>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const GeneralReport = () => {
    const { user } = useAuth();
    const userStatus = user?.status?.toLowerCase();
    const [showModal, setShowModal] = useState(true);
    const [isFetchingReport, setIsFetchingReport] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });
    const [groups, setGroups] = useState([]);
    const [churches, setChurches] = useState([]);

    const [reportData, setReportData] = useState({
        meta: { groupName: '', churchName: '' }, 
        monday: null, thursday: null, sunday: null, gck: null, homeCaringFellowship: null, seminar: []
    });

    const [formData, setFormData] = useState({
        groupId: null,
        churchId: null,
        startMonth: '',
        endMonth: new Date().toISOString().slice(0, 7)
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                if (userStatus === 'manager') {
                    const groupRes = await groupService.getGroups();
                    setGroups(groupRes.groups || groupRes.data || groupRes || []);
                }
                const churchParams = (userStatus !== 'manager' && user?.groupId) ? { groupId: user?.groupId } : {};
                const churchRes = await churchService.getChurches(churchParams);
                setChurches(churchRes.churches || churchRes.data || churchRes || []);
            } catch (err) { console.error(err); }
            finally { setIsLoadingInitial(false); }
        };
        if (user) loadInitialData();
    }, [user, userStatus]);

    const formatMonthDisplay = (val) => val ? new Date(val + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '-';
    
    const getSelectedGroupName = () => {
        return reportData.meta?.groupName || user?.groupName || "N/A";
    };
    
    const getSelectedChurchName = () => {
        if (formData.churchId === 'group') return 'Entire Group';
        return reportData.meta?.churchName || user?.churchName || "";
    };

    const handleParamChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleLoadReport = async (e) => {
        e.preventDefault();

        const isChurchLevel = userStatus === 'churchpastor' || userStatus === 'churchadmin';
        const isGroupLevel = userStatus === 'groupadmin' || userStatus === 'grouppastor';

        if (!isChurchLevel && !formData.groupId && !formData.churchId) {
            setFlash({ message: 'Please select either a Group or a Church.', type: 'danger' });
            return;
        }

        if (formData.startMonth >= formData.endMonth) {
            setFlash({ message: 'Start Month must be strictly before the End Month.', type: 'danger' });
            return;
        }

        setIsFetchingReport(true);
        try {
            let finalGroupId = formData.groupId;
            let finalChurchId = formData.churchId;

            if (isChurchLevel) {
                finalChurchId = user?.churchId;
                finalGroupId = null;
            } else if (isGroupLevel) {
                if (formData.churchId === 'group') {
                    finalGroupId = user?.groupId;
                    finalChurchId = null;
                } else {
                    finalChurchId = formData.churchId;
                    finalGroupId = null;
                }
            } else if (userStatus === 'manager' && formData.churchId === 'group') {
                finalGroupId = formData.groupId;
                finalChurchId = null;
            }

            const rawPayload = {
                startMonth: formData.startMonth,
                endMonth: formData.endMonth,
                groupId: finalGroupId,
                churchId: finalChurchId,
            };

            const cleanPayload = Object.fromEntries(
                Object.entries(rawPayload).filter(([_, v]) => v != null && v !== "")
            );

            const data = await reportService.generalReport(cleanPayload);
            setReportData(data);
            setShowModal(false);
            setFlash({ message: 'General report loaded successfully.', type: 'success' });
        } catch (err) {
            setFlash({ message: err.response?.data?.message || "Failed to load general report.", type: 'danger' });
        } finally {
            setIsFetchingReport(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsFetchingReport(true);
        const rangeText = `${formatMonthDisplay(formData.startMonth)} - ${formatMonthDisplay(formData.endMonth)}`;
        try {
            const doc = <GeneralReportPDF data={reportData} month={rangeText} logo={logo} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GeneralReport_${getSelectedChurchName()}_${formData.startMonth || 'start'}_to_${formData.endMonth}.pdf`;
            link.click();
        } catch (err) { setFlash({ message: 'Error generating PDF.', type: 'danger' }); }
        finally { setIsFetchingReport(false); }
    };

    const VerticalServiceTable = ({ title, icon, data, colorClass }) => {
        const d = data || { am: 0, af: 0, at: 0, ym: 0, yf: 0, yt: 0, cm: 0, cf: 0, ct: 0, nm: 0, nf: 0, nt: 0, o1: "0.00", o2: "0.00", ot: "0.00" };

        return (
            <div className={`${styles['service-card']} shadow-sm mb-4`}>
                <div className={`${styles['service-title']} ${colorClass}`}>{icon} {title}</div>
                <div className={styles['table-wrapper']}>
                    <table className={`${styles['report-table']} general-report-table`}>
                        <thead>
                            <tr className="table-header-main"><th colSpan="4">Average Attendance</th></tr>
                            <tr className="table-header-sub"><th>Category</th><th>Males</th><th>Females</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Adults</td><td>{d.am}</td><td>{d.af}</td><td>{d.at}</td></tr>
                            <tr><td>Youths</td><td>{d.ym}</td><td>{d.yf}</td><td>{d.yt}</td></tr>
                            <tr><td>Children</td><td>{d.cm}</td><td>{d.cf}</td><td>{d.ct}</td></tr>
                            <tr><td>New Comers</td><td>{d.nm}</td><td>{d.nf}</td><td>{d.nt}</td></tr>
                            <tr className="attendance-total-row">
                                <td>Total Attendance</td>
                                <td>{(Number(d.am) + Number(d.ym) + Number(d.cm))}</td>
                                <td>{(Number(d.af) + Number(d.yf) + Number(d.cf))}</td>
                                <td>{(Number(d.at) + Number(d.yt) + Number(d.ct))}</td>
                            </tr>
                            <tr className="offering-header-row"><td colSpan="4">Average Offering</td></tr>
                            <tr><td>1st Offering</td><td colSpan="3">GH₵ {d.o1}</td></tr>
                            <tr><td>2nd Offering</td><td colSpan="3">GH₵ {d.o2}</td></tr>
                            <tr className="offering-total-row"><td>Total Offering</td><td colSpan="3">GH₵ {d.ot}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const SpecialServiceTable = ({ title, data, colorClass, shouldAverage = true }) => {
        const arr = data || [];
        const avgData = (shouldAverage && !data) ? { a: 0, y: 0, c: 0, t: 0 } : data;
        const totals = (!shouldAverage && arr.length > 0) ? arr.reduce((acc, curr) => ({
            a: acc.a + (curr.adults || 0), y: acc.y + (curr.youths || 0), c: acc.c + (curr.children || 0), t: acc.t + (curr.total || 0)
        }), { a: 0, y: 0, c: 0, t: 0 }) : { a: 0, y: 0, c: 0, t: 0 };

        return (
            <div className={`${styles['service-card']} shadow-sm mb-4`}>
                <div className={`${styles['service-title']} ${colorClass}`}>⛪ {title} {shouldAverage && "(Average)"}</div>
                <div className={styles['table-wrapper']}>
                    <table className={`${styles['report-table']} general-report-table`}>
                        <thead>
                            <tr className="table-header-sub"><th>{shouldAverage ? "Category" : "Date"}</th><th>Adults</th><th>Youths</th><th>Children</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            {shouldAverage ? (
                                <tr>
                                    <td>Averages for Selected Period</td>
                                    <td>{avgData?.a || 0}</td><td>{avgData?.y || 0}</td><td>{avgData?.c || 0}</td><td>{avgData?.t || 0}</td>
                                </tr>
                            ) : (
                                <>
                                    {arr.length > 0 ? arr.map((r, i) => (
                                        <tr key={i}>
                                            <td>{new Date(r.date).toISOString().split('T')[0]}</td>
                                            <td>{r.adults}</td><td>{r.youths}</td><td>{r.children}</td><td>{r.total}</td>
                                        </tr>
                                    )) : <tr><td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic' }}>No records found</td></tr>}
                                    <tr className="attendance-total-row">
                                        <td>Total</td><td>{totals.a}</td><td>{totals.y}</td><td>{totals.c}</td><td>{totals.t}</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.reportPageWrapper}>
            <style>{`
                .form-group-row-responsive { display: flex; gap: 15px; width: 100%; }
                .general-report-table { width: 100%; border-collapse: collapse; }
                .general-report-table th, .general-report-table td { padding: 8px 4px !important; font-size: 0.85rem !important; border: 1px solid #e2e8f0; text-align: left; }
                .table-header-main th { background: #1e293b !important; color: #ffffff !important; text-align: center; }
                .table-header-sub th { background: #334155 !important; color: #ffffff !important; }
                .attendance-total-row { font-weight: bold; background-color: #f1f5f9; }
                .offering-header-row td { text-align: center; font-weight: bold; background: #f8fafc; color: #1e293b; }
                .offering-total-row { font-weight: bold; }

                @media (max-width: 600px) {
                    .form-group-row-responsive { flex-direction: column; gap: 0; }
                    .general-report-table { font-size: 0.75rem !important; }
                    .general-report-table th, .general-report-table td { padding: 6px 2px !important; }
                }
            `}</style>

            <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />
            <div className={styles['app-container']}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>📊 General Report</h1>
                        <p>Service Performance Analysis Range</p>
                    </div>

                    <div className={styles['report-info']}>
                        <div className={styles['report-info-group']}>
                            <div className={styles['report-info-item']}><span className={styles['report-info-label']}>Group:</span><span className={styles['report-info-value']}>{getSelectedGroupName()}</span></div>
                            {formData.churchId !== 'group' && <div className={styles['report-info-item']}><span className={styles['report-info-label']}>Church:</span><span className={styles['report-info-value']}>{getSelectedChurchName()}</span></div>}
                            <div className={styles['report-info-item']}><span className={styles['report-info-label']}>Period:</span><span className={styles['report-info-value']}>{formatMonthDisplay(formData.startMonth)} - {formatMonthDisplay(formData.endMonth)}</span></div>
                        </div>
                        <button className={styles['change-btn']} onClick={() => setShowModal(true)}>Change Parameters</button>
                    </div>

                    <div className={styles.content}>
                        <VerticalServiceTable title="Sunday Worship Service" icon="⛪" data={reportData?.sunday} colorClass={styles.sunday} />
                        <VerticalServiceTable title="Monday Bible Studies" icon="📖" data={reportData?.monday} colorClass={styles.monday} />
                        <VerticalServiceTable title="Thursday Revival & Evangelism" icon="🔥" data={reportData?.thursday} colorClass={styles.thursday} />
                        <div style={{ margin: '40px 0', borderTop: '2px dashed #cbd5e1' }}></div>
                        <SpecialServiceTable title="GCK" data={reportData?.gck} colorClass={styles.sunday} shouldAverage={true} />
                        <SpecialServiceTable title="Home Caring Fellowship" data={reportData?.homeCaringFellowship} colorClass={styles.monday} shouldAverage={true} />
                        <SpecialServiceTable title="Seminars" data={reportData?.seminar} colorClass={styles.thursday} shouldAverage={false} />
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button className={styles['print-button']} onClick={handleDownloadPDF} disabled={isFetchingReport || !reportData?.sunday}>
                                {isFetchingReport ? 'Generating PDF...' : 'Generate PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className={styles['modal-overlay']} onClick={() => setShowModal(false)}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <div className={styles['modal-header']}><h2>📊 Select Report Parameters</h2></div>
                        <form onSubmit={handleLoadReport} className={styles['modal-form']}>
                            <RequireAccess minStatus="manager"><SearchSelect label="Select Group" options={groups.map(g => ({ value: g._id, label: g.name }))} value={formData.groupId} onChange={(v) => handleParamChange('groupId', v)} placeholder="Search Group..." isLoading={isLoadingInitial} disabled={formData.churchId !== null && formData.churchId !== 'group'} /></RequireAccess>
                            <RequireAccess minStatus="groupAdmin"><SearchSelect label="Select Church" options={[...(userStatus.includes('group') ? [{ value: 'group', label: 'Whole Group' }] : []), ...churches.map(c => ({ value: c._id, label: c.name || c.churchname }))]} value={formData.churchId} onChange={(v) => handleParamChange('churchId', v)} placeholder="Search Church..." isLoading={isLoadingInitial} disabled={formData.groupId !== null} /></RequireAccess>

                            <div className="form-group-row-responsive">
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles['form-label']}>Start Month</label>
                                    <input type="month" className={styles['month-input']} value={formData.startMonth} onChange={(e) => handleParamChange('startMonth', e.target.value)} required />
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles['form-label']}>End Month</label>
                                    <input type="month" className={styles['month-input']} value={formData.endMonth} onChange={(e) => handleParamChange('endMonth', e.target.value)} required />
                                </div>
                            </div>

                            <button type="submit" className={styles['submit-button']} disabled={isFetchingReport}>
                                {isFetchingReport ? 'Loading...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralReport;