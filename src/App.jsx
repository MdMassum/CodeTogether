import { useState } from 'react'
import './App.css'
import{BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/editor/:roomId' element={<EditorPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
