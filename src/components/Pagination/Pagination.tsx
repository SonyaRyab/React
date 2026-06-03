import { Pagination as BootstrapPagination } from 'react-bootstrap'

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <=1){
		return null;
	}
	
	const items =[];
	for (let number = 1; number <= totalPages number++){
		items.push(
			<BootstrapPagination.Item
			key = {number}
			active = {number === currentPage}
			onClick = {() => onPageChange(number)}
			>
				{number}
			</BootstrapPagination.Item>,	
		);
	}
	//дальше идет обработка кнопок первая страница, следующая, предыдущая ...
	return (
	<BootstrapPagination>
		<BootstrapPagination.First onClick={() => onPageChange(1)} disabled = {currentPage === 1} />
		<BootstrapPagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled = {currentPage === 1} />
		{items}
		<BootstrapPagination.Next onClick={() => onPageChange(currentPage + 1)}	disabled={currentPage === totalPages} />
		<BootstrapPagination.Last onClick={() => onPageChange(totalPages)} disabled ={currentPage === totalPages} />
		</BootstrapPagination>
	);
};