import {Component, inject} from '@angular/core';
import {BreadcrumbService, CareersService, RoutesService, StudentsHttpService} from "@services/core";
import {Router} from "@angular/router";
import {AuthService} from "@services/auth";
import {CatalogueEnrollmentStateEnum} from "@utils/enums";
import {EnrollmentModel} from "@models/core";

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent {
  protected transactionMenus: any = [];
  protected scheduleLinks: any[] = [];
  private readonly authService = inject(AuthService);
  private readonly routesService = inject(RoutesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);
  private readonly careersService = inject(CareersService);
  private readonly studentsHttpService = inject(StudentsHttpService);
  protected state: boolean = true;
  protected enrollment!: EnrollmentModel;

  constructor() {
    this.breadcrumbService.setItems([{label: 'Dashboard'}]);
    this.findEnrollmentByStudent();
  }

  findEnrollmentByStudent() {
    this.studentsHttpService.findEnrollmentByStudent(this.authService.auth.student.id)
      .subscribe(enrollment => {
        this.enrollment = enrollment;

        if (enrollment?.enrollmentState) {
          switch (enrollment.enrollmentState.state.code) {
            case CatalogueEnrollmentStateEnum.ENROLLED:
            case CatalogueEnrollmentStateEnum.APPROVED:
            case CatalogueEnrollmentStateEnum.REQUEST_SENT:
            case CatalogueEnrollmentStateEnum.REGISTERED:
              this.state = true;
              break
            default:
              this.state = false;
          }
        }

        this.loadScheduleLinks();
        this.loadMenus();
      });
  }

  loadScheduleLinks() {
    this.scheduleLinks.push(
      {
        //AGROECOLOGIA
        code: '650811G01-S-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/EgSLGDcS14tHjZy-Ph0nzGIBio-QqjDWDZSwXTU7p4i7qw?e=PcGiZh'
      },
      {
        //COMUNICACION COMUNITARIA
        code: '1068-650321H01-H-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/EgrhCRR5zihOv7KH6Z0pQmcB0CfcbcBD8Lph0zHDI61PaA?e=UWNPp2'
      },
      {
        //DERECHO
        code: '650331C01-S-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/En4Ue_-29vdJqCT8D4QsR74BgvTawcwkv01i7t5UZ4ZdxA?e=Seiozx'
      },
      {
        //ECONOMIA
        code: '1068-650311D01-H-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/Epb1gvpIelhAufckZD-5XU4BV5QBoBRpOFwKRc4ZtWVw2A?e=kyNf4m'
      },
      {
        //GESTION DEL AGUA
        code: '1068-6503183A01-H-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/Egdd9z2zORFNmqi313uNJN0B4qnd7SUXJQu5t02AtRoA8A?e=AoHT2k'
      },
      {
        //GESTION DEL DESARROLLO INFANTIL
        code: '650112B01-S-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/EmUevc_eAZ5MleFjlMUeR64BTw6Q2WF-KMPK8vVIGdZmBQ?e=CnQRpL'
      },
      {
        //LENGUA Y CULTURA
        code: '650314H01-S-1702',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/EpnSsMyW395DhePIkPubs8IBxj-TQwKFy1ecLSF12yQTiQ?e=dV6zrp'
      },
      {
        //SABERES ANCESTRALES
        code: '1068-650314H01-H-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/EsKnGIVuplRBi7fBXr6WHa4BDx3wmOxN4xLhOLyQ71nGOA?e=c8dKoM'
      },
      {
        //TURISMO
        code: '651015D01-H-1701',
        link: 'https://uwaec-my.sharepoint.com/:f:/g/personal/vicerrectorado_academico_uaw_edu_ec/ErbPZiI7bMxEvhYKs2eiZXQBOIoPo6ce09RGLqdsy9ipUA?e=mrF5Sv'
      }
    );
  }

  loadMenus() {
    const assetsPath = 'assets/images/components/dashboards/student';

    this.transactionMenus.push(
      {
        enabled: true,
        code: 'enrollment_application',
        header: 'Proceso de matricula',
        subheader: 'Gestionar',
        img: `${assetsPath}/enrollment-application.png`,
        routerLink: '/core/student/enrollment-application',
      },
      {
        enabled: true,
        code: 'subjects',
        header: 'Mis Asignaturas',
        subheader: 'Ver',
        img: `${assetsPath}/subjects.png`,
        routerLink: '/core/student/enrollment-subjects',
      },
      {
        code: 'eva',
        enabled: this.state,
        header: 'EVA',
        subheader: 'EVA',
        img: `${assetsPath}/schedule.png`,
        routerLink: 'https://yec-eva.yavirac.edu.ec',
      },
    );
  }

  redirect(menu: any) {
    if (menu.code === 'eva') {
      const downloadLink = document.createElement('a');
      downloadLink.href = menu.routerLink;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
    } else {
      this.router.navigate([menu.routerLink]);
    }
  }
}
