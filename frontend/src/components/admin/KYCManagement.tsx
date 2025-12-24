import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, FileText, ExternalLink, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface KYCDocument {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  documentType: string;
  documentUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  adminNotes: string | null;
  reviewedAt?: string;
}

export const KYCManagement = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/kyc');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      toast.error("Failed to load KYC documents");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedDoc) return;
    setProcessing(true);

    try {
      await api.put(`/kyc/${selectedDoc._id}/review`, {
        status,
        adminNotes: adminNotes || undefined,
      });

      toast.success(`Document ${status === "approved" ? "approved ✅" : "rejected ❌"}`);
      setSelectedDoc(null);
      setAdminNotes("");
      fetchDocuments();
    } catch (error) {
      console.error("Error updating KYC document:", error);
      toast.error("Failed to update document");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            KYC Documents ({pendingCount} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No KYC documents submitted yet</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {doc.status === "approved" ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : doc.status === "rejected" ? (
                        <XCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{doc.user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{doc.user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.documentType.replace("_", " ")} • {new Date(doc.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewImageUrl(doc.documentUrl)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setAdminNotes(doc.adminNotes || "");
                      }}
                      disabled={doc.status !== 'pending'}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review KYC Document</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{selectedDoc.user.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedDoc.user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Document Type</p>
                  <p className="font-medium capitalize">{selectedDoc.documentType.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedDoc.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Document Preview:</p>
                {selectedDoc.documentUrl.startsWith('data:image') ? (
                  <img
                    src={selectedDoc.documentUrl}
                    alt="KYC Document"
                    className="max-h-64 mx-auto rounded border"
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedDoc.documentUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes (optional, will be shown to user if rejected)"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleReview("rejected")}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleReview("approved")}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image View Dialog */}
      <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
        <DialogContent className="bg-card border-border max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {viewImageUrl && (
            <div className="max-h-[70vh] overflow-auto">
              <img src={viewImageUrl} alt="Document" className="w-full rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
