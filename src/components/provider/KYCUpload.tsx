import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type KYCStatus = 'pending' | 'approved' | 'rejected';

interface KYCDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  status: KYCStatus;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export const KYCUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/kyc/my-documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to MongoDB
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { fileUrl } = uploadResponse.data;

      // Save to KYC database
      await api.post('/kyc', {
        documentType,
        documentUrl: fileUrl,
      });

      toast({
        title: "Document uploaded",
        description: "Your document has been submitted for review",
      });

      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Pending Review</Badge>;
    }
  };

  const overallStatus = documents.length > 0
    ? documents.every(d => d.status === 'approved')
      ? 'approved'
      : documents.some(d => d.status === 'rejected')
        ? 'rejected'
        : 'pending'
    : null;

  const requiredDocuments = [
    { type: 'government_id', label: 'Government ID', description: 'Passport, Driver\'s License, or National ID' },
    { type: 'address_proof', label: 'Proof of Address', description: 'Utility bill or bank statement (last 3 months)' },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              KYC Verification
            </CardTitle>
            <CardDescription>Upload documents to verify your identity</CardDescription>
          </div>
          {overallStatus && (
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              {getStatusBadge(overallStatus)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {overallStatus === 'approved' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="p-4 rounded-full bg-green-500/20 mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-green-500">Verification Complete</h3>
            <p className="text-muted-foreground mt-2">Your identity has been verified. You can now accept bookings!</p>
          </motion.div>
        ) : (
          <>
            {overallStatus === null && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-500">Verification Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please upload the required documents below to start accepting bookings.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {requiredDocuments.map((doc) => {
                const existingDoc = documents.find(d => d.documentType === doc.type);

                return (
                  <div key={doc.type} className="p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.label}</p>
                          {existingDoc && getStatusBadge(existingDoc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>

                        {existingDoc?.status === 'rejected' && existingDoc.adminNotes && (
                          <p className="text-sm text-destructive mt-2">
                            Rejection reason: {existingDoc.adminNotes}
                          </p>
                        )}
                      </div>

                      <div>
                        {(!existingDoc || existingDoc.status === 'rejected') && (
                          <Label htmlFor={doc.type} className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                              <Upload className="h-4 w-4" />
                              {uploading ? 'Uploading...' : 'Upload'}
                            </div>
                            <Input
                              id={doc.type}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleUpload(e, doc.type)}
                              disabled={uploading}
                            />
                          </Label>
                        )}
                        {existingDoc?.status === 'pending' && (
                          <div className="text-sm text-muted-foreground">Under review</div>
                        )}
                        {existingDoc?.status === 'approved' && (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
