import loading from '../../assets/images/loading-pana.svg';
import ContainerCarrot from '../Container';
import { LoadingContainer } from './Loading.styled';

function Loading() {
    return (
        <LoadingContainer>
            <ContainerCarrot>
                <div className="loading">
                    <img src={loading} alt="Loading..." />
                </div>
            </ContainerCarrot>
        </LoadingContainer>
    );
}
export default Loading;