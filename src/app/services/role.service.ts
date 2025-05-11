import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { environment } from "../../environments/environment"

export interface Role {
  id: string
  name: string
  permissions: string[]
  // Add other role properties as needed
}

@Injectable({
  providedIn: "root",
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/api/v1/roles`

  constructor(private http: HttpClient) {}

  // GET /api/v1/roles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl)
  }
}
