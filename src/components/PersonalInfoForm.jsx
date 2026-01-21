import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import FlashMessage from './FlashMessage';

// Added 'user' and 'churches' to props
const PersonalInfoForm = ({ data, onChange, onNext, onImageChange, user, churches }) => {

    const [flash, setFlash] = useState({ message: '', type: '' });
    const [emailError, setEmailError] = useState('');

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    // Check if user has permission to see the church select dropdown
    const allowedRoles = ['manager', 'grouppastor', 'groupadmin'];
    const showChurchSelect = user && user.status && allowedRoles.includes(user.status.toLowerCase());

    const continueStep = (e) => {
        e.preventDefault();
        stopCamera();
        onNext();
    };

    const validateEmail = () => {
        const email = data.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
        }
    };

    const handleEmailChange = (e) => {
        if (emailError) setEmailError('');
        onChange(e);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setIsCropping(true);
                setZoom(1);
            });
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const constraints = { video: { facingMode: 'environment' } };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            setFlash({ message: "Could not access camera.", type: "danger" });
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            setImageSrc(canvas.toDataURL('image/jpeg', 0.8));
            stopCamera();
            setIsCropping(true);
            setZoom(1);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onImageChange(croppedImage);
            setIsCropping(false);
            setImageSrc(null);
        } catch (e) {
            console.error(e);
        }
    };

    const cancelCrop = () => {
        setIsCropping(false);
        setImageSrc(null);
    };

    const removeImage = () => {
        onImageChange(null);
    };

    return (
        <div>
            <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />
            <h4 className="mb-3 text-center">Personal Details</h4>
            <form onSubmit={continueStep}>

                {/* IMAGE SECTION */}
                <div className="mb-4">
                    {isCropping ? (
                        <div className="bg-light p-3 border rounded">
                            <h6 className="text-center mb-2">Adjust Image</h6>
                            <div className="position-relative w-100" style={{ height: '300px', backgroundColor: '#f8f9fa' }}>
                                <Cropper 
                                    image={imageSrc} 
                                    crop={crop} 
                                    zoom={zoom} 
                                    aspect={1} 
                                    onCropChange={setCrop} 
                                    onCropComplete={onCropComplete} 
                                    onZoomChange={setZoom} 
                                    cropShape="round" 
                                    disablePan={true}
                                    showGrid={false}
                                    restrictPosition={false}
                                    minZoom={0.5}
                                    maxZoom={3}
                                />
                            </div>
                            <div className="mt-3">
                                <label className="form-label text-muted small">Zoom</label>
                                <input 
                                    type="range" 
                                    value={zoom} 
                                    min={0.5} 
                                    max={3} 
                                    step={0.1} 
                                    onChange={(e) => setZoom(Number(e.target.value))} 
                                    className="form-range" 
                                />
                            </div>
                            <div className="d-flex justify-content-center gap-2 mt-2">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelCrop}>Cancel</button>
                                <button type="button" className="btn btn-primary btn-sm" onClick={showCroppedImage}>Done</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isCameraOpen ? (
                                <div className="mb-3 text-center">
                                    <div className="d-block mx-auto position-relative border bg-black rounded overflow-hidden" style={{ maxWidth: '300px' }}>
                                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                                    </div>
                                    <div className="mt-2">
                                        <button type="button" className="btn btn-danger btn-sm me-2" onClick={stopCamera}>Cancel</button>
                                        <button type="button" className="btn btn-success btn-sm" onClick={capturePhoto}>Snap Photo</button>
                                    </div>
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>
                            ) : (
                                <>
                                    {data.profileImage ? (
                                        <img src={data.profileImage} alt="Profile Preview" className="d-block mx-auto mb-3 border shadow-sm" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        <div className="d-block mx-auto mb-3 border bg-light rounded-circle d-flex flex-column align-items-center justify-content-center text-muted" style={{ width: '150px', height: '150px' }}>
                                            <i className="bi bi-person-fill" style={{ fontSize: '3rem', lineHeight: '1' }}></i>
                                            <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>Profile Preview</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-center gap-2 align-items-center">
                                        {data.profileImage && (
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={removeImage} title="Remove Image"><i className="bi bi-trash"></i></button>
                                        )}
                                        <label className="btn btn-outline-primary btn-sm mb-0">
                                            <i className="bi bi-upload me-1"></i> Upload
                                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                        </label>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={startCamera}>
                                            <i className="bi bi-camera me-1"></i> Camera
                                        </button>
                                    </div>
                                    <div className="text-center form-text mt-1">Picture is optional</div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* FORM FIELDS */}
                <div className="row">
                    
                    {showChurchSelect && (
                        <div className="col-12 mb-3">
                            <label className="form-label">Select Church <span style={{color: 'red'}}>*</span></label>
                            <select 
                                name="churchId" 
                                className="form-select" 
                                onChange={onChange} 
                                value={data.churchId || ''} 
                                required
                            >
                                <option value="">Select Church</option>
                                {churches && churches.map((church) => (
                                    <option key={church._id} value={church._id}>
                                        {church.churchname || church.name} 
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input type="text" name="firstName" className="form-control" onChange={onChange} value={data.firstName || ''} autoComplete='off' required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input type="text" name="lastName" className="form-control" onChange={onChange} value={data.lastName || ''} autoComplete='off' required />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className={`form-control ${emailError ? 'is-invalid' : ''}`} onChange={handleEmailChange} onBlur={validateEmail} value={data.email || ''} autoComplete='off' />
                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Gender <span style={{color: 'red'}}>*</span></label>
                        <select name="gender" className="form-select" onChange={onChange} value={data.gender || ''} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Relationship Status <span style={{color: 'red'}}>*</span></label>
                        <select name="relationshipStatus" className="form-select" onChange={onChange} value={data.relationshipStatus || ''} required>
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Separated">Separated</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Category <span style={{color: 'red'}}>*</span></label>
                        <select name="category" className="form-select" onChange={onChange} value={data.category || ''} required>
                            <option value="">Select Category</option>
                            <option value="Adult">Adult</option>
                            <option value="Youth">Youth</option>
                            <option value="Children">Children</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Member Status <span style={{color: 'red'}}>*</span></label>
                        <select name="memberStatus" className="form-select" onChange={onChange} value={data.memberStatus || ''} required>
                            <option value="">Select Status</option>
                            <option value="Worker">Worker</option>
                            <option value="Non-worker">Non-worker</option>
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">Next</button>
                </div>
            </form>
        </div>
    );
};

export default PersonalInfoForm;




const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    // Cap output size
    const MAX_SIZE = 600;
    
    let width = pixelCrop.width;
    let height = pixelCrop.height;

    if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
            height = height * (MAX_SIZE / width);
            width = MAX_SIZE;
        } else {
            width = width * (MAX_SIZE / height);
            height = MAX_SIZE;
        }
    }

    canvas.width = width;
    canvas.height = height;

    // Fill Background with White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'medium';

    // Draw Image Logic
    const scaleX = width / pixelCrop.width;
    const scaleY = height / pixelCrop.height;

    // Calculate position on canvas
    const dx = -pixelCrop.x * scaleX;
    const dy = -pixelCrop.y * scaleY;
    const dw = image.width * scaleX;
    const dh = image.height * scaleY;

    ctx.drawImage(image, dx, dy, dw, dh);

    // Compress
    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    
    // Cleanup
    canvas.width = 0;
    canvas.height = 0;

    return base64;
}