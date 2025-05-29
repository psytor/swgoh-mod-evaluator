import { useState } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'

function App() {
  const [playerData, setPlayerData] = useState(null)

  return (
    <div className="app">
      {!playerData ? (
        <AllyCodeEntry onDataFetched={setPlayerData} />
      ) : (
        <ModList playerData={playerData} />
      )}
    </div>
  )
}

export default App
