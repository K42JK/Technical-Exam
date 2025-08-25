import ConnectWalletComponent from "./components/ConnectWalletComponent";
import IntegrationsComponent from "./components/IntegrationsComponent";
import 'bootstrap/dist/css/bootstrap.min.css';

function App(){
    return (
        <div className="container py-3 px-3 px-md-4">
            <div className="row justify-content-center g-3">
                <div className="col-12 col-lg-11 col-xl-10">
                    <ConnectWalletComponent />
                </div>

                
                <div className="col-12 col-lg-11 col-xl-10">
                    <IntegrationsComponent />
                </div>

            </div>
        </div>
    );
};

export default App;