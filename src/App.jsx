import { Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import EnquiryForm from "./components/EnquiryForm";
import AdmissionForm from "./components/AdmissionForm";
import EnquiriesList from "./components/EnquiriesList";
import StudentList from "./components/StudentList";
import InstituteLogin from "./components/InstituteLogin";
import CoursesManagement from "./components/CoursesManagement";
import SettingsPage from "./components/SettingsPage";
import FeeManagement from "./components/FeeManagement";
import AttendanceManagement from "./components/AttendanceManagement";
import DocumentUpload from "./components/DocumentUpload";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/Dashboard";
import NotFound from "./components/NotFound";
import Signup from "./components/Signup";
import { useNavigate } from "react-router";
import { Navigate } from "react-router";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    const navigate = useNavigate();
    const handleSignup = (token) => {
        localStorage.setItem("access_token", token);
        navigate("/");
    };
    return (
        <div>
            <ToastContainer />

            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <AppLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="enquiry" element={<EnquiryForm />} />
                    <Route path="admission" element={<AdmissionForm />} />
                    <Route path="admissions" element={<StudentList />} />
                    <Route
                        path="admissions/edit/:id"
                        element={<AdmissionForm />}
                    />
                    <Route path="enquiries" element={<EnquiriesList />} />
                    <Route
                        path="attendance"
                        element={<AttendanceManagement />}
                    />
                    <Route path="courses" element={<CoursesManagement />} />
                    <Route path="fees" element={<FeeManagement />} />
                    <Route path="documents" element={<DocumentUpload />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="/login" element={<InstituteLogin />} />
                <Route
                    path="/signup"
                    element={<Signup onSignup={handleSignup} />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;
