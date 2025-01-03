
import './App.css'
import{BrowserRouter, Routes, Route} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import { RecoilRoot } from 'recoil'

function App() {

  return (
    <>
      <div>
        <Toaster
            // position="top-right"
            toastOptions={{
                success: {
                    theme: {
                        primary: '#4aed88',
                    },
                },
            }}
        ></Toaster>
      </div>
    
      <BrowserRouter>
      <RecoilRoot>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/editor/:roomId' element={<EditorPage/>}/>
        </Routes>
      </RecoilRoot>
      </BrowserRouter>
    </>
  )
}

export default App
