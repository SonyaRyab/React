import { useState, useRef } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import { FURNITURE_MOCK } from './modules/mock';
import type { IFurniture } from './modules/mock';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useFurnitureSearch } from './hooks/useFurnitureSearch';

// Расширяем интерфейс для UI (добавляем score и видимость)
interface IProcessedItem extends IFurniture {
    score: number;      
    isVisible: boolean; 
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    items, 
    ready, 
    progress, 
    imageEmbedding, 
    searchByImage, 
    resetSearch 
  } = useFurnitureSearch(FURNITURE_MOCK);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLabel = ready ? 'Загрузить фото' : 'Загрузка нейросети...';
  const isUploadDisabled = !ready;
  const canReset = Boolean(selectedImage);

  return (
    <div className="app-container">
      <h1>AI Поиск мебели</h1>
      <p className="text-muted">Загрузите фото, чтобы найти похожий товар</p>

      <div className="search-section">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />

        <div style={{ flexShrink: 0 }}>
            {selectedImage ? (
                <img src={selectedImage} alt="Query" className="preview-image" />
            ) : (
                <div className="placeholder-image">Нет фото</div>
            )}
        </div>

        <div className="action-panel">
            <Button 
              className="action-btn" 
              variant="primary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploadDisabled}
            >
                {uploadLabel}
            </Button>

            {!ready && (
              <ProgressBar className="action-progress" now={progress} label={`${Math.round(progress)}%`} animated />
            )}

            {imageEmbedding && (
                <div className="embed-preview">
                    <strong>Image Embed: </strong><br/>
                    [{imageEmbedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]
                </div>
            )}
            
            <Button 
              className="action-btn" 
              variant="outline-danger" 
              onClick={handleClear} 
              disabled={!canReset}
            >
              Сбросить
            </Button>
        </div>
      </div>

      <div className="items-list">
        {items.map((item) => {
            if (!item.isVisible) return null;

            return (
              <div key={item.id} className="furniture-row">
                    <img src={item.image} alt={item.name} className="row-image" />
                    
                    <div className="row-content">
                        <h5>{item.name}</h5>
                        <p className="text-muted mb-1">{item.description}</p>
                        <strong className="text-primary">{item.price.toLocaleString()} ₽</strong>
                    </div>

                    <div className="row-stats">
                        <div>
                            Similarity: 
                            <span className="similarity-value">
                                { `${(item.score * 100).toFixed(1)}%`}
                            </span>
                        </div>
                        
                        {/* Отображаем вектор, если он есть */}
                        {item.embedding && (
                            <div className="embed-preview-text">
                                <strong>Text Embed:</strong><br/>
                                [{item.embedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}

export default App;