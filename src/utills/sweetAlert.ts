import Swal, { SweetAlertResult } from "sweetalert2";

export async function deleteConfirmation(
  text: string = "Do you want to delete this record!",
  confirmButtonText: string = "Yes, delete it!"
): Promise<SweetAlertResult> {
  const response: SweetAlertResult = await Swal.fire({
    title: "Are you sure?",
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText,
    customClass: {
      popup: "p-1",
    },
    heightAuto: false,
  });

  return response;

  // .then((result) => {
  //   if (result.isConfirmed) {
  //     Swal.fire({
  //       title: "Deleted!",
  //       text: "Your file has been deleted.",
  //       icon: "success",
  //     });
  //   }
  // });
}
