import { DataProvider } from './store/DataContext'
import { FilterProvider } from './store/FilterContext'
import { ThemeProvider } from './store/ThemeContext'
import Shell from './components/Shell'

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <FilterProvider>
          <Shell />
        </FilterProvider>
      </DataProvider>
    </ThemeProvider>
  )
}
