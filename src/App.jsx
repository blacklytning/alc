import React from 'react'
import StudentEnquiryForm from './components/StudentEnquiryForm'
import StudentAdmissionForm from './components/StudentAdmissionForm'
import FeeReceipt from './components/FeeReceipt'
import StudentEnquiriesList from './components/StudentEnquiriesList'
import StudentAdmissionsList from './components/StudentAdmissionsList'
import InstituteLogin from './components/InstituteLogin'

function App() {
  return (
    <div>
      {/* <StudentEnquiryForm /> */}
      <StudentAdmissionForm />
      {/* <FeeReceipt /> */}
      {/* <StudentEnquiriesList /> */}
      <StudentAdmissionsList />
      <InstituteLogin />
    </div>
  )
}

export default App
