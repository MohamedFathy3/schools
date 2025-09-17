export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  status: string;
  date: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface DataTableProps {
  headers: string[];
  data: Employee[];
  onViewDetails: (item: Employee) => void;
}

export interface DetailsContentProps {
  item: Employee;
}