import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global-service';
import { AdminService } from '../../../services/admin.service';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-rides',
  templateUrl: './admin-rides.component.html',
  styleUrls: ['./admin-rides.component.scss'],
  providers: [DatePipe]
})
export class AdminRidesComponent implements OnInit {

  activeTab: 'rides' | 'requests' = 'rides';

  // Raw data from API
  allRides: any[] = [];
  allRequests: any[] = [];

  // Filtered data for display
  rides: any[] = [];
  requests: any[] = [];

  isLoadingRides: boolean = false;
  isLoadingRequests: boolean = false;
  isExporting: boolean = false;

  // ── Filter Models ──
  filterDateFrom: string = '';
  filterDateTo: string = '';
  filterEmployee: string = '';
  filterStatus: string = '';

  // ── Pagination ──
  currentPage: number = 1;
  pageSize: number = 8;

  // ── Quick Stats ──
  get totalActiveRides(): number { return this.allRides.filter(r => r.isActive).length; }
  get totalInactiveRides(): number { return this.allRides.filter(r => !r.isActive).length; }
  get totalAccepted(): number { return this.allRequests.filter(r => r.isAccept).length; }
  get totalRejected(): number { return this.allRequests.filter(r => r.isReject).length; }
  get totalPending(): number { return this.allRequests.filter(r => !r.isAccept && !r.isReject).length; }

  constructor(
      private _globalService: GlobalService,
      private adminService: AdminService,
      private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
      this.loadRides();
      this.loadRequests();
  }

  loadRides() {
      this.isLoadingRides = true;
      this.adminService.getAllRides().subscribe({
          next: (res: any) => {
              if (res && res.status === 1) {
                  this.allRides = res.data || [];
                  this.applyFilters();
              }
              this.isLoadingRides = false;
          },
          error: (err) => {
              console.error(err);
              this.isLoadingRides = false;
          }
      });
  }

  loadRequests() {
      this.isLoadingRequests = true;
      this.adminService.getAllRideRequests().subscribe({
          next: (res: any) => {
               if (res && res.status === 1) {
                  this.allRequests = res.data || [];
                  this.applyFilters();
              }
              this.isLoadingRequests = false;
          },
          error: (err) => {
              console.error(err);
              this.isLoadingRequests = false;
          }
      });
  }

  setActiveTab(tab: 'rides' | 'requests') {
      this.activeTab = tab;
      this.currentPage = 1;
      this.applyFilters();
  }

  // ═══════════════════════════════════════════
  //  FILTERS — Working Logic
  // ═══════════════════════════════════════════
  applyFilters() {
    this.currentPage = 1;

    if (this.activeTab === 'rides') {
      let filtered = [...this.allRides];

      // Date From filter
      if (this.filterDateFrom) {
        const from = new Date(this.filterDateFrom);
        from.setHours(0, 0, 0, 0);
        filtered = filtered.filter(r => {
          const rDate = new Date(r.ride_Date);
          return rDate >= from;
        });
      }

      // Date To filter
      if (this.filterDateTo) {
        const to = new Date(this.filterDateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => {
          const rDate = new Date(r.ride_Date);
          return rDate <= to;
        });
      }

      // Employee name filter
      if (this.filterEmployee && this.filterEmployee.trim()) {
        const search = this.filterEmployee.toLowerCase().trim();
        filtered = filtered.filter(r =>
          (r.userName || '').toLowerCase().includes(search)
        );
      }

      // Status filter
      if (this.filterStatus) {
        if (this.filterStatus === 'Active') {
          filtered = filtered.filter(r => r.isActive);
        } else if (this.filterStatus === 'Inactive') {
          filtered = filtered.filter(r => !r.isActive);
        }
      }

      this.rides = filtered;
    } else {
      let filtered = [...this.allRequests];

      // Date From filter
      if (this.filterDateFrom) {
        const from = new Date(this.filterDateFrom);
        from.setHours(0, 0, 0, 0);
        filtered = filtered.filter(r => {
          const rDate = new Date(r.ride_Date);
          return rDate >= from;
        });
      }

      // Date To filter
      if (this.filterDateTo) {
        const to = new Date(this.filterDateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => {
          const rDate = new Date(r.ride_Date);
          return rDate <= to;
        });
      }

      // Employee name filter (search requester or ride owner)
      if (this.filterEmployee && this.filterEmployee.trim()) {
        const search = this.filterEmployee.toLowerCase().trim();
        filtered = filtered.filter(r =>
          (r.requesterName || '').toLowerCase().includes(search) ||
          (r.rideOwnerName || '').toLowerCase().includes(search)
        );
      }

      // Status filter
      if (this.filterStatus) {
        if (this.filterStatus === 'Accepted') {
          filtered = filtered.filter(r => r.isAccept);
        } else if (this.filterStatus === 'Rejected') {
          filtered = filtered.filter(r => r.isReject);
        } else if (this.filterStatus === 'Pending') {
          filtered = filtered.filter(r => !r.isAccept && !r.isReject);
        }
      }

      this.requests = filtered;
    }
  }

  clearFilters() {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterEmployee = '';
    this.filterStatus = '';
    this.currentPage = 1;
    this.applyFilters();
    this._globalService.utilities.notify.info('Filters cleared');
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterDateFrom || this.filterDateTo || this.filterEmployee || this.filterStatus);
  }

  // Status options change based on active tab
  get statusOptions(): { value: string; label: string }[] {
    if (this.activeTab === 'rides') {
      return [
        { value: '', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ];
    } else {
      return [
        { value: '', label: 'All Status' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Pending', label: 'Pending' },
      ];
    }
  }

  // ═══════════════════════════════════════════
  //  PAGINATION
  // ═══════════════════════════════════════════
  get currentData(): any[] {
    return this.activeTab === 'rides' ? this.rides : this.requests;
  }

  get totalPages(): number {
    return Math.ceil(this.currentData.length / this.pageSize) || 1;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.currentData.slice(start, start + this.pageSize);
  }

  get paginatedRides(): any[] {
    if (this.activeTab !== 'rides') return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rides.slice(start, start + this.pageSize);
  }

  get paginatedRequests(): any[] {
    if (this.activeTab !== 'requests') return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.requests.slice(start, start + this.pageSize);
  }

  get showingFrom(): number {
    if (this.currentData.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.currentData.length);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ═══════════════════════════════════════════
  //  EXPORT
  // ═══════════════════════════════════════════
  export(type: string) {
    const data = this.activeTab === 'rides' ? this.rides : this.requests;
    if (data.length === 0) {
      this._globalService.utilities.notify.error('No data available to export!');
      return;
    }

    this.isExporting = true;

    try {
      if (type === 'PDF') {
        this.activeTab === 'rides' ? this.exportRidesPDF() : this.exportRequestsPDF();
      } else if (type === 'Excel') {
        this.activeTab === 'rides' ? this.exportRidesExcel() : this.exportRequestsExcel();
      }
      const tabLabel = this.activeTab === 'rides' ? 'Rides' : 'Ride Requests';
      this._globalService.utilities.notify.success(`${tabLabel} ${type} downloaded successfully! (${data.length} records)`);
    } catch (error) {
      console.error('Export error:', error);
      this._globalService.utilities.notify.error(`Failed to export ${type}. Please try again.`);
    } finally {
      this.isExporting = false;
    }
  }

  filter() {
    this.applyFilters();
    const count = this.currentData.length;
    this._globalService.utilities.notify.success(`Filters applied — ${count} results found`);
  }

  // ═══════════════════════════════════════════
  //  RIDES — PDF EXPORT
  // ═══════════════════════════════════════════
  private exportRidesPDF() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a') || '';

    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GreenCar — Posted Rides Report', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${today}  |  Total Rides: ${this.rides.length}`, 14, 24);

    const activeRides = this.rides.filter(r => r.isActive).length;
    const inactiveRides = this.rides.length - activeRides;
    const summaryY = 42;
    const cards = [
      { label: 'Total Rides', value: `${this.rides.length}`, color: [13, 110, 253] },
      { label: 'Active Rides', value: `${activeRides}`, color: [25, 135, 84] },
      { label: 'Inactive Rides', value: `${inactiveRides}`, color: [108, 117, 125] },
    ];
    cards.forEach((card, i) => {
      const x = 14 + i * 70;
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x, summaryY, 60, 18, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + 4, summaryY + 7);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + 4, summaryY + 14);
    });

    const tableRows = this.rides.map(r => ({
      rideID: `#${r.rideID}`,
      userName: r.userName || 'Unknown',
      from: r.from_Address || 'N/A',
      to: r.to_Address || 'N/A',
      type: `${r.ride_Type || 'N/A'}${r.ride_Frequency ? ' (' + r.ride_Frequency + ')' : ''}`,
      date: this.datePipe.transform(r.ride_Date, 'dd MMM yyyy') || r.ride_Date,
      status: r.isActive ? 'Active' : 'Inactive',
    }));

    autoTable(doc, {
      columns: [
        { header: 'Ride ID', dataKey: 'rideID' },
        { header: 'Employee', dataKey: 'userName' },
        { header: 'From', dataKey: 'from' },
        { header: 'To', dataKey: 'to' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Date', dataKey: 'date' },
        { header: 'Status', dataKey: 'status' },
      ],
      body: tableRows,
      startY: summaryY + 26,
      theme: 'grid',
      headStyles: { fillColor: [13, 110, 253], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
      bodyStyles: { fontSize: 8, cellPadding: 3, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      styles: { lineColor: [222, 226, 230], lineWidth: 0.2 },
      didDrawPage: () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${currentPage} of ${pageCount} — GreenCar Corporate Carpool`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      },
    });

    doc.save(`GreenCar_Rides_${this.getFileTimestamp()}.pdf`);
  }

  // ═══════════════════════════════════════════
  //  REQUESTS — PDF EXPORT
  // ═══════════════════════════════════════════
  private exportRequestsPDF() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a') || '';

    doc.setFillColor(255, 193, 7);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GreenCar — Ride Requests Report', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${today}  |  Total Requests: ${this.requests.length}`, 14, 24);

    const accepted = this.requests.filter(r => r.isAccept).length;
    const rejected = this.requests.filter(r => r.isReject).length;
    const pending = this.requests.filter(r => !r.isAccept && !r.isReject).length;
    const summaryY = 42;
    const cards = [
      { label: 'Total Requests', value: `${this.requests.length}`, color: [13, 110, 253] },
      { label: 'Accepted', value: `${accepted}`, color: [25, 135, 84] },
      { label: 'Rejected', value: `${rejected}`, color: [220, 53, 69] },
      { label: 'Pending', value: `${pending}`, color: [255, 193, 7] },
    ];
    cards.forEach((card, i) => {
      const x = 14 + i * 70;
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x, summaryY, 60, 18, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      if (card.color[0] === 255 && card.color[1] === 193) doc.setTextColor(33, 37, 41);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + 4, summaryY + 7);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + 4, summaryY + 14);
    });

    const tableRows = this.requests.map(r => ({
      reqID: `#${r.requestId}`,
      requester: r.requesterName || 'Unknown',
      owner: r.rideOwnerName || 'Unknown',
      from: r.from_Address || 'N/A',
      to: r.to_Address || 'N/A',
      date: this.datePipe.transform(r.ride_Date, 'dd MMM yyyy') || r.ride_Date,
      status: r.isAccept ? 'Accepted' : (r.isReject ? 'Rejected' : 'Pending'),
    }));

    autoTable(doc, {
      columns: [
        { header: 'Req ID', dataKey: 'reqID' },
        { header: 'Requester', dataKey: 'requester' },
        { header: 'Ride Owner', dataKey: 'owner' },
        { header: 'From', dataKey: 'from' },
        { header: 'To', dataKey: 'to' },
        { header: 'Date', dataKey: 'date' },
        { header: 'Status', dataKey: 'status' },
      ],
      body: tableRows,
      startY: summaryY + 26,
      theme: 'grid',
      headStyles: { fillColor: [255, 193, 7], textColor: [33, 37, 41], fontStyle: 'bold', fontSize: 9, halign: 'center' },
      bodyStyles: { fontSize: 8, cellPadding: 3, halign: 'center' },
      alternateRowStyles: { fillColor: [255, 249, 230] },
      styles: { lineColor: [222, 226, 230], lineWidth: 0.2 },
      didDrawPage: () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${currentPage} of ${pageCount} — GreenCar Corporate Carpool`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      },
    });

    doc.save(`GreenCar_RideRequests_${this.getFileTimestamp()}.pdf`);
  }

  // ═══════════════════════════════════════════
  //  RIDES — EXCEL EXPORT
  // ═══════════════════════════════════════════
  private exportRidesExcel() {
    const excelData = this.rides.map(r => ({
      'Ride ID': r.rideID,
      'Employee': r.userName || 'Unknown',
      'From': r.from_Address || 'N/A',
      'To': r.to_Address || 'N/A',
      'Ride Type': r.ride_Type || 'N/A',
      'Frequency': r.ride_Frequency || 'N/A',
      'Date': this.datePipe.transform(r.ride_Date, 'dd MMM yyyy') || r.ride_Date,
      'Status': r.isActive ? 'Active' : 'Inactive',
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(excelData);
    sheet['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
      { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, 'Rides');

    const activeRides = this.rides.filter(r => r.isActive).length;
    const summarySheet = XLSX.utils.json_to_sheet([
      { 'Metric': 'Total Rides', 'Value': this.rides.length },
      { 'Metric': 'Active Rides', 'Value': activeRides },
      { 'Metric': 'Inactive Rides', 'Value': this.rides.length - activeRides },
      { 'Metric': 'Report Generated On', 'Value': this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a') || '' },
    ]);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `GreenCar_Rides_${this.getFileTimestamp()}.xlsx`);
  }

  // ═══════════════════════════════════════════
  //  REQUESTS — EXCEL EXPORT
  // ═══════════════════════════════════════════
  private exportRequestsExcel() {
    const excelData = this.requests.map(r => ({
      'Request ID': r.requestId,
      'Requester': r.requesterName || 'Unknown',
      'Requester Email': r.requesterEmail || 'N/A',
      'Ride Owner': r.rideOwnerName || 'Unknown',
      'Owner Email': r.rideOwnerEmail || 'N/A',
      'From': r.from_Address || 'N/A',
      'To': r.to_Address || 'N/A',
      'Date': this.datePipe.transform(r.ride_Date, 'dd MMM yyyy') || r.ride_Date,
      'Status': r.isAccept ? 'Accepted' : (r.isReject ? 'Rejected' : 'Pending'),
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(excelData);
    sheet['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
      { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 16 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, 'Ride Requests');

    const accepted = this.requests.filter(r => r.isAccept).length;
    const rejected = this.requests.filter(r => r.isReject).length;
    const pending = this.requests.filter(r => !r.isAccept && !r.isReject).length;
    const summarySheet = XLSX.utils.json_to_sheet([
      { 'Metric': 'Total Requests', 'Value': this.requests.length },
      { 'Metric': 'Accepted', 'Value': accepted },
      { 'Metric': 'Rejected', 'Value': rejected },
      { 'Metric': 'Pending', 'Value': pending },
      { 'Metric': 'Report Generated On', 'Value': this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a') || '' },
    ]);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `GreenCar_RideRequests_${this.getFileTimestamp()}.xlsx`);
  }

  // ═══════════════════════════════════════════
  //  HELPER
  // ═══════════════════════════════════════════
  private getFileTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }
}
