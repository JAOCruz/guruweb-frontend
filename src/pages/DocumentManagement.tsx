import { useEffect, useState, useMemo } from 'react';
import { botAPI, DocumentIndexItem } from '../services/botApi';
import { Search, ChevronDown, ChevronRight, FileText, Folder, Tag, MessageCircle, Loader, List, Network, Grid3x3, Scale, ExternalLink, Eye, X } from 'lucide-react';
import { LAWS } from '../data/laws';
import { NeoCard, NeoButton, NeoInput, NeoSelect, NeoBadge } from '../components/ui/neo';

type ViewMode = 'folder' | 'tree' | 'outline';

interface FolderNode {
  name: string;
  path: string;
  isFolder: boolean;
  documents?: DocumentIndexItem[];
  children?: FolderNode[];
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<DocumentIndexItem | null>(null);
  const [comment, setComment] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('folder');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await botAPI.getDocumentIndex();
        setDocuments(response.data.documents);
      } catch (err) {
        setError('Failed to load documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(documents.map(d => d.category))).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === null || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  // Build hierarchical folder structure
  const folderStructure = useMemo(() => {
    const root: Record<string, FolderNode> = {};

    filteredDocuments.forEach(doc => {
      const category = doc.category;
      const subcategory = doc.subcategory;
      const subsubcategory = doc.sub_subcategory;

      if (!root[category]) {
        root[category] = {
          name: category,
          path: category,
          isFolder: true,
          children: [],
          documents: []
        };
      }

      // If no subcategory, add directly to category
      if (!subcategory) {
        root[category].documents!.push(doc);
        return;
      }

      let subNode = root[category].children!.find(c => c.name === subcategory);
      if (!subNode) {
        subNode = {
          name: subcategory,
          path: `${category}/${subcategory}`,
          isFolder: true,
          children: [],
          documents: []
        };
        root[category].children!.push(subNode);
      }

      // If no sub-subcategory, add directly to subcategory
      if (!subsubcategory) {
        subNode.documents!.push(doc);
        return;
      }

      let subsubNode = subNode.children!.find(c => c.name === subsubcategory);
      if (!subsubNode) {
        subsubNode = {
          name: subsubcategory,
          path: `${category}/${subcategory}/${subsubcategory}`,
          isFolder: true,
          children: [],
          documents: []
        };
        subNode.children!.push(subsubNode);
      }

      if (!subsubNode.documents) {
        subsubNode.documents = [];
      }
      subsubNode.documents.push(doc);
    });

    return Object.values(root).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredDocuments]);

  const handleAddComment = async () => {
    if (!selectedDoc || !comment.trim()) return;

    try {
      await botAPI.addDocumentComment(selectedDoc.id, {
        text: comment,
        author: 'System'
      });
      setComment('');
      setSelectedDoc({
        ...selectedDoc,
        comments: [...selectedDoc.comments, { text: comment, created_at: new Date().toISOString() }]
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // Folder View Component
  const FolderTreeNode = ({ node, level = 0 }: { node: FolderNode; level?: number }) => {
    const isExpanded = expandedFolders.has(node.path);
    const hasDocuments = node.documents && node.documents.length > 0;
    const totalItems = (node.children?.length || 0) + (node.documents?.length || 0);

    return (
      <div key={node.path}>
        {node.isFolder && totalItems > 0 && (
          <>
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-2 p-2 rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors text-left shadow-button"
              style={{ marginLeft: `${level * 16}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-main flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-foreground/60 flex-shrink-0" />
              )}
              <Folder className="w-4 h-4 text-main flex-shrink-0" />
              <span className="font-medium text-base truncate">{node.name}</span>
              {totalItems > 0 && (
                <NeoBadge variant="neutral" className="ml-auto text-xs">
                  {totalItems}
                </NeoBadge>
              )}
            </button>

            {isExpanded && (
              <>
                {node.children?.map(child => (
                  <FolderTreeNode key={child.path} node={child} level={level + 1} />
                ))}

                {hasDocuments && (
                  <>
                    {node.documents!.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full flex items-center gap-2 p-2 rounded-base border-2 text-left transition-colors ${
                          selectedDoc?.id === doc.id
                            ? 'border-border bg-secondary-background shadow-shadow'
                            : 'border-transparent hover:border-border hover:bg-secondary-background'
                        }`}
                        style={{ marginLeft: `${(level + 1) * 16 + 20}px` }}
                      >
                        <FileText className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                        <p className="text-base font-medium truncate">{doc.name}</p>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Tree Diagram Component (with ASCII-style lines)
  const TreeDiagramNode = ({ node, level = 0, isLast = true, prefix = '' }: { node: FolderNode; level?: number; isLast?: boolean; prefix?: string }) => {
    const isExpanded = expandedFolders.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const hasDocuments = node.documents && node.documents.length > 0;

    if (!node.isFolder || (!hasChildren && !hasDocuments)) return null;

    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    return (
      <div key={node.path} className="font-base text-base">
        <button
          onClick={() => toggleFolder(node.path)}
          className="w-full text-left p-2 rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors flex items-center gap-2 shadow-button"
        >
          <span className="text-foreground/60 font-mono text-sm">{prefix}{connector}</span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-main" />
          ) : (
            <ChevronRight className="w-3 h-3 text-foreground/60" />
          )}
          <Folder className="w-3 h-3 text-main" />
          <span className="text-foreground truncate">{node.name}</span>
          {hasDocuments && <span className="text-base text-foreground/60 ml-auto">({node.documents!.length})</span>}
        </button>

        {isExpanded && (
          <>
            {node.children?.map((child, idx) => (
              <TreeDiagramNode
                key={child.path}
                node={child}
                level={level + 1}
                isLast={idx === node.children!.length - 1}
                prefix={nextPrefix}
              />
            ))}

            {hasDocuments && (
              <div>
                {node.documents!.map((doc, idx) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-2 rounded-base border-2 transition-colors flex items-center gap-2 ${
                      selectedDoc?.id === doc.id ? 'border-border bg-secondary-background shadow-shadow' : 'border-transparent hover:border-border hover:bg-secondary-background'
                    }`}
                  >
                    <span className="text-foreground/60 font-mono text-sm">
                      {nextPrefix}
                      {idx === node.documents!.length - 1 ? '└── ' : '├── '}
                    </span>
                    <FileText className="w-3 h-3 text-foreground/60" />
                    <span className="text-foreground truncate text-base">{doc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Outline View Component (compact)
  const OutlineView = () => (
    <div className="space-y-1 p-2">
      {folderStructure.map((folder, idx) => (
        <TreeDiagramNode
          key={folder.path}
          node={folder}
          level={0}
          isLast={idx === folderStructure.length - 1}
          prefix=""
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-main animate-spin" />
          <p className="text-base">Loading document index...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <NeoCard className="text-center p-8">
          <p className="text-base mb-4">{error}</p>
          <NeoButton onClick={() => window.location.reload()}>
            Retry
          </NeoButton>
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-secondary-background border-b-2 border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-4xl md:text-5xl font-black">Gestión de Documentos</h1>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <NeoButton
              onClick={() => setViewMode('folder')}
              variant={viewMode === 'folder' ? 'default' : 'neutral'}
              size="sm"
              title="Folder View"
            >
              <List className="w-4 h-4" />
              Carpetas
            </NeoButton>
            <NeoButton
              onClick={() => setViewMode('tree')}
              variant={viewMode === 'tree' ? 'default' : 'neutral'}
              size="sm"
              title="Tree Diagram"
            >
              <Network className="w-4 h-4" />
              Árbol
            </NeoButton>
            <NeoButton
              onClick={() => setViewMode('outline')}
              variant={viewMode === 'outline' ? 'default' : 'neutral'}
              size="sm"
              title="Outline View"
            >
              <Grid3x3 className="w-4 h-4" />
              Esquema
            </NeoButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <NeoInput
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <NeoSelect
            value={selectedCategory || 'all'}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
            className="w-auto"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </NeoSelect>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 text-base">
          <NeoBadge variant="neutral" className="text-base">
            Total: {documents.length}
          </NeoBadge>
          <NeoBadge variant="neutral" className="text-base">
            Mostrados: {filteredDocuments.length}
          </NeoBadge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Document Tree/List */}
        <div className="flex-1 overflow-auto border-r-2 border-border custom-scroll">
          {viewMode === 'folder' && (
            <div className="p-4 space-y-2">
              {folderStructure.length === 0 ? (
                <p className="text-foreground/50 text-center py-8 text-base">No documents found</p>
              ) : (
                folderStructure.map(folder => (
                  <FolderTreeNode key={folder.path} node={folder} level={0} />
                ))
              )}
            </div>
          )}

          {viewMode === 'tree' && (
            <div className="p-4">
              {folderStructure.length === 0 ? (
                <p className="text-foreground/50 text-center py-8 text-base">No documents found</p>
              ) : (
                folderStructure.map((folder, idx) => (
                  <TreeDiagramNode
                    key={folder.path}
                    node={folder}
                    level={0}
                    isLast={idx === folderStructure.length - 1}
                    prefix=""
                  />
                ))
              )}
            </div>
          )}

          {viewMode === 'outline' && <OutlineView />}
        </div>

        {/* Detail Panel */}
        {selectedDoc ? (
          <div className="min-w-80 max-w-96 bg-secondary-background border-l-2 border-border flex flex-col overflow-hidden">
            {/* Preview Button */}
            {selectedDoc.file_extension === '.pdf' && (
              <div className="p-3 border-b-2 border-border">
                <NeoButton
                  onClick={() => setShowPreview(true)}
                  variant="default"
                  className="w-full"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista previa
                </NeoButton>
              </div>
            )}
            {selectedDoc.file_extension === '.docx' && (
              <div className="p-3 border-b-2 border-border">
                <NeoBadge variant="outline" className="w-full justify-center text-base">
                  <FileText className="w-3.5 h-3.5" />
                  Vista previa no disponible para .docx
                </NeoBadge>
              </div>
            )}

            {/* Document Info */}
            <div className="p-4 border-b-2 border-border overflow-auto custom-scroll">
              <div className="mb-4">
                <h2 className="font-heading text-lg font-bold mb-2 line-clamp-2">{selectedDoc.name}</h2>
                <p className="text-base text-foreground/70 truncate">{selectedDoc.category}</p>
                {selectedDoc.subcategory && (
                  <p className="text-base text-foreground/70 truncate">{selectedDoc.subcategory}</p>
                )}
                {selectedDoc.sub_subcategory && (
                  <p className="text-base text-foreground/70 truncate">{selectedDoc.sub_subcategory}</p>
                )}
              </div>

              <div className="space-y-2 text-base">
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Especialización</p>
                  <p className="font-medium truncate">{selectedDoc.specialization}</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Tipo</p>
                  <p className="font-medium">{selectedDoc.file_extension}</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Tamaño</p>
                  <p className="font-medium">{(selectedDoc.file_size_bytes / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Modificado</p>
                  <p className="font-medium">{new Date(selectedDoc.modified_date).toLocaleDateString()}</p>
                </div>
                {selectedDoc.tags.length > 0 && (
                  <div>
                    <p className="text-foreground/60 uppercase tracking-wide mb-1">Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags.map((tag, idx) => (
                        <NeoBadge key={idx} variant="outline" className="text-xs truncate">
                          <Tag className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{tag}</span>
                        </NeoBadge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leyes relacionadas */}
              {(() => {
                const related = LAWS.filter(law =>
                  law.relatedDocCategories.includes(selectedDoc.category)
                );
                if (related.length === 0) return null;
                return (
                  <NeoCard variant="outline" className="mt-4 p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-3.5 h-3.5 text-main flex-shrink-0" />
                      <h3 className="text-base font-black uppercase tracking-wide">
                        Leyes relacionadas
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {related.map(law => (
                        <a
                          key={law.id}
                          href={law.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-base text-foreground hover:text-main hover:bg-secondary-background rounded-base px-2 py-1.5 transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0 text-foreground/60 group-hover:text-main" />
                          <span className="truncate">{law.institution}</span>
                        </a>
                      ))}
                    </div>
                  </NeoCard>
                );
              })()}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-auto border-t-2 border-border p-3 flex flex-col custom-scroll">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <h3 className="text-base font-semibold">Comentarios ({selectedDoc.comments.length})</h3>
              </div>

              <div className="flex-1 overflow-auto mb-3 space-y-2 custom-scroll">
                {selectedDoc.comments.length === 0 ? (
                  <p className="text-base text-foreground/50 italic">Sin comentarios</p>
                ) : (
                  selectedDoc.comments.map((cmt, idx) => (
                    <NeoCard key={idx} className="p-2">
                      <p className="text-base text-foreground/60 mb-1">{cmt.author || 'Anónimo'}</p>
                      <p className="text-base text-foreground line-clamp-3">{cmt.text}</p>
                      {cmt.created_at && (
                        <p className="text-base text-foreground/50 mt-1">{new Date(cmt.created_at).toLocaleDateString()}</p>
                      )}
                    </NeoCard>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <NeoInput
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Agregar comentario..."
                  className="flex-1"
                />
                <NeoButton
                  onClick={handleAddComment}
                >
                  Enviar
                </NeoButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-w-80 bg-secondary-background border-l-2 border-border flex items-center justify-center">
            <p className="text-foreground/50 text-center px-4 text-base">
              Selecciona un documento para ver detalles
            </p>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && selectedDoc && selectedDoc.file_extension === '.pdf' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
            onClick={() => setShowPreview(false)}
          >
            <NeoCard
              className="w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden p-0"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b-2 border-border flex-shrink-0">
                <span className="text-base font-medium truncate">{selectedDoc.name}</span>
                <NeoButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </NeoButton>
              </div>
              <iframe
                src={botAPI.getDocumentFileUrl(selectedDoc.id)}
                className="flex-1 w-full border-0"
                title={selectedDoc.name}
                sandbox="allow-same-origin allow-scripts"
              />
            </NeoCard>
          </div>
        )}
      </div>
    </div>
  );
}
