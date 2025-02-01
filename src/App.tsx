import './App.css';
import {BackendProvider} from './utils/backendContext';
import Index from '@/compnents/homePage';
import ThemeProvider from "@/compnents/themeProvider";
import LeftNav from "@/compnents/leftNav";
import Footer from "@/compnents/footer";

function App() {


    return (
        <ThemeProvider>
            <LeftNav>
                <BackendProvider>
                    <Index/>
                </BackendProvider>
                <Footer/>
            </LeftNav>
        </ThemeProvider>
    );
}

export default App;
