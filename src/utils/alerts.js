import Swal from 'sweetalert2';

export const showAlert = (title, text, icon = 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#002856',
  });
};

export const showSuccess = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#002856',
  });
};

export const showError = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#002856',
  });
};

export const showConfirm = (title, text, confirmButtonText = 'Sí, continuar', cancelButtonText = 'Cancelar') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#002856',
    cancelButtonColor: '#d33',
    confirmButtonText,
    cancelButtonText
  });
};

const alerts = {
  show: showAlert,
  success: showSuccess,
  error: showError,
  confirm: showConfirm
};

export default alerts;
