import { useState } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import reportService from '../../services/reportService';

const ReportModal = ({ isOpen, onClose, productId, productTitle }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Incorrect Category/Brand',
    'Fake or Counterfeit Item',
    'Suspicious Pricing',
    'Inappropriate Content',
    'Scam or Fraudulent Seller',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport(
        productId,
        reason,
        details
      );
      toast.success('Report submitted successfully. Thank you for keeping our community safe.');
      onClose();
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Listing">
      <div className="mb-6 bg-warning-50 dark:bg-warning-900/20 p-4 rounded-xl border border-warning-200 dark:border-warning-800/50 flex gap-3">
        <HiOutlineExclamationTriangle className="w-6 h-6 text-warning-600 dark:text-warning-500 shrink-0" />
        <div>
          <p className="text-sm text-warning-800 dark:text-warning-400 font-medium">
            You are reporting: <span className="font-bold">{productTitle}</span>
          </p>
          <p className="text-xs text-warning-700 dark:text-warning-500 mt-1">
            Our trust and safety team reviews all reports. False reporting may lead to account suspension.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Why are you reporting this listing? *
          </label>
          <div className="space-y-2">
            {reportReasons.map((r, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-xl cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-surface-900 dark:text-white">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows="3"
            placeholder="Please provide any additional information to help us understand the issue..."
            className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;
